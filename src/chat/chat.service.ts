import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface ChatMessage {
  id: string;
  session_id: string;
  nome: string;
  email: string | null;
  mensagem: string;
  created_at: string;
}

@Injectable()
export class ChatService {
  constructor(private supabaseService: SupabaseService) {}

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

  async criarMensagem(
    sessionId: string,
    nome: string,
    email: string | null,
    mensagem: string,
  ): Promise<ChatMessage | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_chat_mensagens')
      .insert([
        {
          session_id: sessionId,
          nome,
          email,
          mensagem,
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
