import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateLiveConfigDto, IniciarLiveDto } from './dto/live-config.dto';

const LIVE_CONFIG_ID = 'c0000000-0000-0000-0000-000000000001';

@Injectable()
export class LiveService {
  constructor(private supabaseService: SupabaseService) {}

  async getConfig() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_config')
      .select('*')
      .eq('id', LIVE_CONFIG_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  }

  async updateConfig(dto: UpdateLiveConfigDto) {
    const updateData: Record<string, unknown> = {};

    if (dto.ativa !== undefined) updateData.ativa = dto.ativa;
    if (dto.url_stream !== undefined) updateData.url_stream = dto.url_stream;
    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descricao !== undefined) updateData.descricao = dto.descricao;
    if (dto.mensagem_offline !== undefined)
      updateData.mensagem_offline = dto.mensagem_offline;
    if (dto.proxima_live_titulo !== undefined)
      updateData.proxima_live_titulo = dto.proxima_live_titulo;
    if (dto.proxima_live_data !== undefined)
      updateData.proxima_live_data = dto.proxima_live_data;
    if (dto.proxima_live_descricao !== undefined)
      updateData.proxima_live_descricao = dto.proxima_live_descricao;
    if (dto.mostrar_contador_viewers !== undefined)
      updateData.mostrar_contador_viewers = dto.mostrar_contador_viewers;
    if (dto.cor_badge !== undefined) updateData.cor_badge = dto.cor_badge;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_config')
      .update(updateData)
      .eq('id', LIVE_CONFIG_ID)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async iniciarLive(dto: IniciarLiveDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_config')
      .update({
        ativa: true,
        url_stream: dto.url_stream,
        titulo: dto.titulo,
        descricao: dto.descricao || null,
      })
      .eq('id', LIVE_CONFIG_ID)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async pararLive() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('live_config')
      .update({ ativa: false })
      .eq('id', LIVE_CONFIG_ID)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getStatus() {
    const config = await this.getConfig();

    if (!config) {
      return {
        ativa: false,
        titulo: null,
        viewers: 0,
      };
    }

    // Contar viewers ativos
    const doisMinutosAtras = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const { count } = await this.supabaseService
      .getClient()
      .from('live_viewers')
      .select('*', { count: 'exact', head: true })
      .eq('assistindo', true)
      .gte('ultima_atividade', doisMinutosAtras);

    return {
      ativa: config.ativa,
      titulo: config.titulo,
      descricao: config.descricao,
      viewers: count || 0,
      url_stream: config.url_stream,
    };
  }
}
