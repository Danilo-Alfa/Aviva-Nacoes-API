import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RegisterTokenDto } from './dto/notification.dto';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100;

interface ExpoPushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  channelId?: string;
  priority?: 'default' | 'normal' | 'high';
}

interface ExpoPushResult {
  data: Array<{
    status: 'ok' | 'error';
    details?: { error?: string };
  }>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private supabaseService: SupabaseService) {}

  // ─── Registrar / atualizar token ──────────────────────
  async registerToken(dto: RegisterTokenDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('push_tokens')
      .upsert(
        {
          token: dto.token,
          platform: dto.platform,
          device_name: dto.device_name || null,
          app_version: dto.app_version || null,
          ativo: true,
          last_used_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' },
      )
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  // ─── Buscar todos os tokens ativos ────────────────────
  async getActiveTokens(): Promise<string[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('push_tokens')
      .select('token')
      .eq('ativo', true);

    if (error) {
      this.logger.error('Erro ao buscar tokens ativos:', error);
      return [];
    }

    return (data || []).map((t) => t.token);
  }

  // ─── Enviar notificacao de live iniciada ──────────────
  async sendLiveStartedNotification(
    titulo: string,
    mensagem?: string,
  ): Promise<{ enviados: number; falhas: number; desativados: number }> {
    const tokens = await this.getActiveTokens();

    if (tokens.length === 0) {
      this.logger.log('Nenhum token ativo encontrado');
      return { enviados: 0, falhas: 0, desativados: 0 };
    }

    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title: titulo,
      body:
        mensagem ||
        'Uma transmissao ao vivo acabou de comecar! Toque para assistir.',
      data: {
        type: 'live_started',
        screen: 'live',
      },
      sound: 'default',
      channelId: 'live-alerts',
      priority: 'high',
    }));

    let enviados = 0;
    let falhas = 0;
    let desativados = 0;

    // Enviar em lotes de 100 (limite da API Expo)
    const chunks = this.chunkArray(messages, BATCH_SIZE);

    for (const chunk of chunks) {
      try {
        const response = await fetch(EXPO_PUSH_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(chunk),
        });

        const result: ExpoPushResult = await response.json();

        if (result.data) {
          for (let i = 0; i < result.data.length; i++) {
            const pushResult = result.data[i];

            if (pushResult.status === 'ok') {
              enviados++;
            } else {
              falhas++;
              const errorType = pushResult.details?.error;

              // Desativar tokens invalidos
              if (
                errorType === 'DeviceNotRegistered' ||
                errorType === 'InvalidCredentials'
              ) {
                desativados++;
                await this.deactivateToken(chunk[i].to);
              }
            }
          }
        }
      } catch (err) {
        this.logger.error('Erro ao enviar push notifications:', err);
        falhas += chunk.length;
      }
    }

    this.logger.log(
      `Push enviados: ${enviados}, falhas: ${falhas}, desativados: ${desativados}`,
    );

    return { enviados, falhas, desativados };
  }

  // ─── Desativar token ──────────────────────────────────
  private async deactivateToken(token: string): Promise<void> {
    try {
      await this.supabaseService
        .getClient()
        .from('push_tokens')
        .update({ ativo: false, updated_at: new Date().toISOString() })
        .eq('token', token);
    } catch (err) {
      this.logger.error(`Erro ao desativar token: ${token}`, err);
    }
  }

  // ─── Estatisticas ─────────────────────────────────────
  async getStats() {
    const { count: total } = await this.supabaseService
      .getClient()
      .from('push_tokens')
      .select('*', { count: 'exact', head: true });

    const { count: ativos } = await this.supabaseService
      .getClient()
      .from('push_tokens')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    return {
      total: total || 0,
      ativos: ativos || 0,
      inativos: (total || 0) - (ativos || 0),
    };
  }

  // ─── Limpar tokens inativos (mais de 30 dias) ────────
  async cleanupStaleTokens(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('push_tokens')
      .update({ ativo: false, updated_at: new Date().toISOString() })
      .lt('last_used_at', thirtyDaysAgo.toISOString())
      .eq('ativo', true)
      .select();

    if (error) {
      this.logger.error('Erro ao limpar tokens inativos:', error);
      return 0;
    }

    return data?.length || 0;
  }

  // ─── Helpers ──────────────────────────────────────────
  private chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
}
