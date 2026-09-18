import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { IdentidadeChatService } from './identidade.service';
import { LimiteDeMensagens } from './limite-mensagens';
import {
  JoinChatDto,
  NovaMensagemDto,
  DeletarMensagemDto,
  LimparChatDto,
} from './dto/chat.dto';

/**
 * Usuario conectado ao chat.
 *
 * `nome` nulo significa espectador: le o chat, mas nao escreve. Quem entra com
 * o Google chega com `verificado: true` e todos os dados vindos do Supabase.
 */
interface UsuarioConectado {
  sessionId: string;
  nome: string | null;
  email: string | null;
  userId: string | null;
  avatarUrl: string | null;
  verificado: boolean;
  entrouEm: Date;
}

const TAMANHO_MAXIMO_MENSAGEM = 500;
const TAMANHO_MAXIMO_NOME = 100;

/**
 * Origens aceitas pelo socket.
 *
 * FRONTEND_URL aceita varias separadas por virgula. Sem ela, reflete a origem
 * de quem chama: o padrao antigo era 'http://localhost:5173', o que derrubava
 * o transporte polling em producao (o navegador bloqueia por CORS) e deixava o
 * chat dependendo so do websocket — quando a rede do visitante nao permite o
 * upgrade, sobrava "Nao foi possivel conectar ao chat". Nao ha risco de CSRF
 * aqui porque a identidade vem de um token no payload, nunca de cookie.
 */
function origensPermitidas(): string[] | boolean {
  const configurado = process.env.FRONTEND_URL?.trim();

  if (!configurado) {
    return true;
  }

  return configurado
    .split(',')
    .map((origem) => origem.trim())
    .filter((origem) => origem.length > 0);
}

@WebSocketGateway({
  cors: {
    origin: origensPermitidas(),
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, UsuarioConectado>();
  private limite = new LimiteDeMensagens();

  constructor(
    private chatService: ChatService,
    private configService: ConfigService,
    private identidadeService: IdentidadeChatService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);

    if (user?.nome) {
      this.server.emit('user_left', {
        nome: user.nome,
        timestamp: new Date().toISOString(),
      });
    }

    this.connectedUsers.delete(client.id);
    this.limite.esquecer(client.id);
    this.server.emit('users_online', this.connectedUsers.size);

    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinChatDto,
  ) {
    const { sessionId, token } = data;

    const identidade = await this.identidadeService.resolver(token);

    // Token enviado mas recusado: a sessao expirou ou foi adulterada. O cliente
    // precisa saber para pedir login de novo em vez de achar que esta escrevendo.
    if (token && !identidade) {
      client.emit('sessao_invalida', {
        message: 'Sua sessao expirou. Entre novamente para participar do chat.',
      });
    }

    const usuario: UsuarioConectado = identidade
      ? {
          sessionId,
          nome: identidade.nome,
          email: identidade.email,
          userId: identidade.userId,
          avatarUrl: identidade.avatarUrl,
          verificado: true,
          entrouEm: new Date(),
        }
      : {
          sessionId,
          nome: this.nomeLegado(data.nome),
          email: data.email ?? null,
          userId: null,
          avatarUrl: null,
          verificado: false,
          entrouEm: new Date(),
        };

    this.connectedUsers.set(client.id, usuario);

    console.log(
      `[CHAT] Join - sessionId: ${sessionId}, nome: ${usuario.nome ?? '(espectador)'}, verificado: ${usuario.verificado}`,
    );

    // Devolve a identidade que o servidor assumiu, para a tela mostrar a verdade
    client.emit('identidade', {
      nome: usuario.nome,
      email: usuario.email,
      avatarUrl: usuario.avatarUrl,
      verificado: usuario.verificado,
      podeEscrever: usuario.nome !== null,
    });

    this.server.emit('users_online', this.connectedUsers.size);

    const mensagens = await this.chatService.getMensagens(50);
    client.emit('mensagens_anteriores', mensagens);

    if (usuario.nome) {
      client.broadcast.emit('user_joined', {
        nome: usuario.nome,
        timestamp: new Date().toISOString(),
      });
    }

    return { success: true };
  }

  @SubscribeMessage('nova_mensagem')
  async handleNovaMensagem(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: NovaMensagemDto,
  ) {
    const user = this.connectedUsers.get(client.id);

    if (!user) {
      client.emit('erro', { message: 'Usuário não autenticado no chat' });
      return;
    }

    if (!user.nome) {
      client.emit('erro', {
        message: 'Entre com o Google para enviar mensagens no chat.',
      });
      return;
    }

    const { mensagem } = data;

    if (!mensagem || mensagem.trim().length === 0) {
      return;
    }

    if (mensagem.length > TAMANHO_MAXIMO_MENSAGEM) {
      client.emit('erro', {
        message: `Mensagem muito longa (máx. ${TAMANHO_MAXIMO_MENSAGEM} caracteres)`,
      });
      return;
    }

    const permissao = this.limite.registrar(client.id);

    if (!permissao.permitido) {
      client.emit('erro', { message: permissao.motivo });
      return;
    }

    const novaMensagem = await this.chatService.criarMensagem({
      sessionId: user.sessionId,
      nome: user.nome,
      email: user.email,
      userId: user.userId,
      avatarUrl: user.avatarUrl,
      mensagem: mensagem.trim(),
    });

    if (!novaMensagem) {
      client.emit('erro', { message: 'Erro ao enviar mensagem' });
      return;
    }

    this.server.emit('mensagem', novaMensagem);

    return { success: true };
  }

  @SubscribeMessage('deletar_mensagem')
  async handleDeletarMensagem(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: DeletarMensagemDto,
  ) {
    const { mensagemId, adminPassword } = data;

    // Verificar senha de admin (fail-closed: sem env configurada, nega tudo —
    // senao remover ADMIN_PASSWORD liberaria undefined === undefined)
    const validPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!validPassword || adminPassword !== validPassword) {
      client.emit('erro', { message: 'Não autorizado' });
      return;
    }

    const success = await this.chatService.deletarMensagem(mensagemId);

    if (!success) {
      client.emit('erro', { message: 'Erro ao deletar mensagem' });
      return;
    }

    // Notificar todos que a mensagem foi deletada
    this.server.emit('mensagem_deletada', { mensagemId });

    return { success: true };
  }

  @SubscribeMessage('limpar_chat')
  async handleLimparChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LimparChatDto,
  ) {
    const { adminPassword } = data;

    // Fail-closed: sem env configurada, nega tudo
    const validPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!validPassword || adminPassword !== validPassword) {
      client.emit('erro', { message: 'Não autorizado' });
      return;
    }

    const success = await this.chatService.limparChat();

    if (!success) {
      client.emit('erro', { message: 'Erro ao limpar chat' });
      return;
    }

    this.server.emit('chat_limpo');

    return { success: true };
  }

  @SubscribeMessage('digitando')
  handleDigitando(@ConnectedSocket() client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user?.nome) {
      client.broadcast.emit('usuario_digitando', { nome: user.nome });
    }
  }

  @SubscribeMessage('parou_digitar')
  handleParouDigitar(@ConnectedSocket() client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user?.nome) {
      client.broadcast.emit('usuario_parou_digitar', { nome: user.nome });
    }
  }

  // Método público para emitir eventos de fora do gateway
  emitToAll(event: string, data: unknown) {
    this.server.emit(event, data);
  }

  getUsersOnline(): number {
    return this.connectedUsers.size;
  }

  /**
   * Caminho de transicao: o aplicativo ainda envia nome digitado, sem token.
   * Com CHAT_EXIGIR_LOGIN=true esse caminho fecha e so entra quem tem conta.
   */
  private nomeLegado(nome?: string): string | null {
    if (this.configService.get<string>('CHAT_EXIGIR_LOGIN') === 'true') {
      return null;
    }

    const limpo = nome?.trim().slice(0, TAMANHO_MAXIMO_NOME);

    return limpo && limpo.length > 0 ? limpo : null;
  }
}
