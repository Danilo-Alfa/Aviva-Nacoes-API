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
import {
  JoinChatDto,
  NovaMensagemDto,
  DeletarMensagemDto,
  LimparChatDto,
} from './dto/chat.dto';

interface ConnectedUser {
  sessionId: string;
  nome: string;
  email?: string;
  joinedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(
    private chatService: ChatService,
    private configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);

    if (user) {
      this.server.emit('user_left', {
        nome: user.nome,
        timestamp: new Date().toISOString(),
      });
    }

    this.connectedUsers.delete(client.id);
    this.server.emit('users_online', this.connectedUsers.size);

    console.log(`Cliente desconectado: ${client.id}`);
  }

  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinChatDto,
  ) {
    const { sessionId, nome, email } = data;

    console.log(`[CHAT] Join recebido - sessionId: ${sessionId}, nome: ${nome}`);

    // Armazenar dados do usuário
    this.connectedUsers.set(client.id, {
      sessionId,
      nome: nome || 'Anônimo',
      email,
      joinedAt: new Date(),
    });

    // Emitir atualização de usuários online
    this.server.emit('users_online', this.connectedUsers.size);

    // Carregar últimas mensagens
    const mensagens = await this.chatService.getMensagens(50);
    client.emit('mensagens_anteriores', mensagens);

    // Notificar que alguém entrou
    client.broadcast.emit('user_joined', {
      nome: nome || 'Anônimo',
      timestamp: new Date().toISOString(),
    });

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

    const { mensagem } = data;

    // Validar mensagem
    if (!mensagem || mensagem.trim().length === 0) {
      return;
    }

    if (mensagem.length > 500) {
      client.emit('erro', {
        message: 'Mensagem muito longa (máx. 500 caracteres)',
      });
      return;
    }

    // Salvar no banco
    const novaMensagem = await this.chatService.criarMensagem(
      user.sessionId,
      user.nome,
      user.email || null,
      mensagem.trim(),
    );

    if (!novaMensagem) {
      client.emit('erro', { message: 'Erro ao enviar mensagem' });
      return;
    }

    console.log(`[CHAT] Mensagem salva - session_id: ${novaMensagem.session_id}, nome: ${novaMensagem.nome}`);

    // Emitir mensagem para todos os clientes conectados
    this.server.emit('mensagem', novaMensagem);

    return { success: true };
  }

  @SubscribeMessage('deletar_mensagem')
  async handleDeletarMensagem(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: DeletarMensagemDto,
  ) {
    const { mensagemId, adminPassword } = data;

    // Verificar senha de admin
    const validPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (adminPassword !== validPassword) {
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

    const validPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (adminPassword !== validPassword) {
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
    if (user) {
      client.broadcast.emit('usuario_digitando', { nome: user.nome });
    }
  }

  @SubscribeMessage('parou_digitar')
  handleParouDigitar(@ConnectedSocket() client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
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
}
