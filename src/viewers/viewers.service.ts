import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegistrarViewerDto } from './dto/viewer.dto';

@Injectable()
export class ViewersService {
  constructor(private supabaseService: SupabaseService) {}

  private getDoisMinutosAtras(): string {
    return new Date(Date.now() - 2 * 60 * 1000).toISOString();
  }

  async registrarViewer(dto: RegistrarViewerDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .upsert(
        {
          session_id: dto.session_id,
          nome: dto.nome || null,
          email: dto.email || null,
          user_agent: dto.user_agent || null,
          ultima_atividade: new Date().toISOString(),
          assistindo: true,
        },
        {
          onConflict: 'session_id',
        },
      )
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar viewer:', error);
      throw error;
    }

    return data;
  }

  async atualizarHeartbeat(sessionId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .update({
        ultima_atividade: new Date().toISOString(),
        assistindo: true,
      })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Erro ao atualizar heartbeat:', error);
    }

    return { success: !error };
  }

  async sairDaLive(sessionId: string) {
    const { error } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .update({
        assistindo: false,
        ultima_atividade: new Date().toISOString(),
      })
      .eq('session_id', sessionId);

    if (error) {
      console.error('Erro ao sair da live:', error);
    }

    return { success: !error };
  }

  async contarViewersAtivos(): Promise<number> {
    const { count, error } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('*', { count: 'exact', head: true })
      .eq('assistindo', true)
      .gte('ultima_atividade', this.getDoisMinutosAtras());

    if (error) {
      console.error('Erro ao contar viewers:', error);
      return 0;
    }

    return count || 0;
  }

  async getViewersAtivos() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('*')
      .eq('assistindo', true)
      .gte('ultima_atividade', this.getDoisMinutosAtras())
      .order('entrou_em', { ascending: false });

    if (error) {
      console.error('Erro ao buscar viewers ativos:', error);
      return [];
    }

    return data || [];
  }

  async getTodosViewers() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('*')
      .order('ultima_atividade', { ascending: false });

    if (error) {
      console.error('Erro ao buscar todos viewers:', error);
      return [];
    }

    return data || [];
  }

  async getViewer(sessionId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('*')
      .eq('session_id', sessionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar viewer:', error);
      return null;
    }

    return data;
  }

  async limparViewersInativos(): Promise<number> {
    // Primeiro conta quantos serão removidos
    const { count } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('*', { count: 'exact', head: true })
      .lt('ultima_atividade', this.getDoisMinutosAtras());

    // Remove os inativos
    const { error } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .delete()
      .lt('ultima_atividade', this.getDoisMinutosAtras());

    if (error) {
      console.error('Erro ao limpar viewers inativos:', error);
      return 0;
    }

    return count || 0;
  }

  async getEstatisticas() {
    const viewersAtivos = await this.contarViewersAtivos();

    const { data } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('entrou_em')
      .order('entrou_em', { ascending: true })
      .limit(1);

    const { data: ultimo } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('entrou_em')
      .order('entrou_em', { ascending: false })
      .limit(1);

    const { count: total } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('*', { count: 'exact', head: true });

    return {
      viewers_ativos: viewersAtivos,
      total_registros: total || 0,
      primeiro_viewer: data?.[0]?.entrou_em || null,
      ultimo_viewer: ultimo?.[0]?.entrou_em || null,
    };
  }
}
