import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase/supabase.service';
import { CriarContatoDto } from './dto/contato.dto';

@Injectable()
export class ContatoService {
  private readonly logger = new Logger(ContatoService.name);

  constructor(
    private supabaseService: SupabaseService,
    private configService: ConfigService,
  ) {}

  // ─── Criar mensagem de contato ─────────────────────────
  async criar(dto: CriarContatoDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('mensagens_contato')
      .insert([
        {
          nome: dto.nome,
          email: dto.email,
          telefone: dto.telefone || null,
          assunto: dto.assunto,
          mensagem: dto.mensagem,
        },
      ])
      .select()
      .single();

    if (error) {
      this.logger.error('Erro ao salvar mensagem de contato:', error);
      throw error;
    }

    // Enviar notificação no Telegram (aguarda antes de retornar - necessário em serverless)
    try {
      await this.enviarNotificacaoTelegram(dto);
    } catch (err) {
      this.logger.error('Erro ao enviar notificação Telegram:', err);
    }

    return data;
  }

  // ─── Notificação via Telegram Bot ──────────────────────
  private async enviarNotificacaoTelegram(dto: CriarContatoDto): Promise<void> {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID não configurados. Notificação Telegram ignorada.',
      );
      return;
    }

    const texto = [
      '📩 Nova mensagem no Fale Conosco',
      '',
      `Nome: ${dto.nome}`,
      `E-mail: ${dto.email}`,
      `Telefone: ${dto.telefone || 'Não informado'}`,
      `Assunto: ${dto.assunto}`,
      '',
      `Mensagem:`,
      dto.mensagem,
    ].join('\n');

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Telegram API retornou ${response.status}: ${body}`);
    }

    this.logger.log('Notificação Telegram enviada com sucesso');
  }
}
