import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ChatMessage {
  id: string;
  session_id: string;
  nome: string;
  email: string | null;
  user_id: string | null;
  avatar_url: string | null;
  mensagem: string;
  created_at: string;
}

/**
 * Dados de uma mensagem nova. Nome, e-mail e foto vem da identidade resolvida
 * no gateway, nunca do que o cliente digitou.
 */
export interface NovaMensagem {
  sessionId: string;
  nome: string;
  email: string | null;
  userId: string | null;
  avatarUrl: string | null;
  mensagem: string;
}

export interface BloqueadoChat {
  user_id: string;
  nome: string | null;
  email: string | null;
  created_at: string;
}

export interface BloqueioChat {
  userId: string;
  nome: string | null;
  email: string | null;
  motivo: string | null;
  bloqueadoPor: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Conta impedida de escrever. Falha aberta de proposito: se a tabela ainda
   * nao existe (SQL de moderacao nao rodou), o chat continua funcionando em vez
   * de derrubar todo mundo — o log avisa.
   */
  async estaBloqueado(userId: string): Promise<boolean> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_chat_bloqueios')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      this.logger.warn(`Nao foi possivel conferir bloqueio de ${userId}: ${error.message}`);
      return false;
    }

    return !!data;
  }

  async bloquear(bloqueio: BloqueioChat): Promise<boolean> {
    const { error } = await this.supabaseService
      .getClient()
      .from('live_chat_bloqueios')
      .upsert(
        {
          user_id: bloqueio.userId,
          nome: bloqueio.nome,
          email: bloqueio.email,
          motivo: bloqueio.motivo,
          bloqueado_por: bloqueio.bloqueadoPor,
        },
        { onConflict: 'user_id' },
      );

    if (error) {
      this.logger.error(`Erro ao bloquear ${bloqueio.userId}: ${error.message}`);
      return false;
    }

    return true;
  }

  /**
   * Lista as contas bloqueadas, para o admin ver e desfazer. Falha aberta pelo
   * mesmo motivo de estaBloqueado: sem a tabela, o chat segue funcionando.
   */
  async listarBloqueios(): Promise<BloqueadoChat[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_chat_bloqueios')
      .select('user_id, nome, email, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.warn(`Nao foi possivel listar bloqueios: ${error.message}`);
      return [];
    }

    return data ?? [];
  }

  async desbloquear(userId: string): Promise<boolean> {
    const { error } = await this.supabaseService
      .getClient()
      .from('live_chat_bloqueios')
      .delete()
      .eq('user_id', userId);

    if (error) {
      this.logger.error(`Erro ao desbloquear ${userId}: ${error.message}`);
      return false;
    }

    return true;
  }

  async getMensagens(limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_chat_mensagens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }

    // Retornar em ordem cronológica
    return (data || []).reverse();
  }

  async criarMensagem(dados: NovaMensagem): Promise<ChatMessage | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_chat_mensagens')
      .insert([
        {
          session_id: dados.sessionId,
          nome: dados.nome,
          email: dados.email,
          user_id: dados.userId,
          avatar_url: dados.avatarUrl,
          mensagem: dados.mensagem,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar mensagem:', error);
      return null;
    }

    return data;
  }

  async deletarMensagem(mensagemId: string): Promise<boolean> {
    const { error } = await this.supabaseService
      .getClient()
      .from('live_chat_mensagens')
      .delete()
      .eq('id', mensagemId);

    if (error) {
      console.error('Erro ao deletar mensagem:', error);
      return false;
    }

    return true;
  }

  async limparChat(): Promise<boolean> {
    const { error } = await this.supabaseService
      .getClient()
      .from('live_chat_mensagens')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error('Erro ao limpar chat:', error);
      return false;
    }

    return true;
  }

  async getEstatisticas() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_chat_mensagens')
      .select('session_id, created_at');

    if (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        total_mensagens: 0,
        usuarios_unicos: 0,
      };
    }

    const usuariosUnicos = new Set(data?.map((m) => m.session_id) || []);

    return {
      total_mensagens: data?.length || 0,
      usuarios_unicos: usuariosUnicos.size,
    };
  }
}
