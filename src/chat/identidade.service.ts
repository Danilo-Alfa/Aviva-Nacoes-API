import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

/**
 * Identidade de quem escreve no chat, resolvida SEMPRE no servidor a partir do
 * token do Supabase. O cliente nunca informa nome, e-mail ou foto: quem entrou
 * com o Google aparece com o nome da conta Google, sem chance de se passar por
 * outra pessoa.
 */
export interface IdentidadeChat {
  userId: string;
  nome: string;
  email: string | null;
  avatarUrl: string | null;
  /** Admin do painel (profiles.role = 'admin'): pode apagar e bloquear. */
  admin: boolean;
}

const TAMANHO_MAXIMO_NOME = 100;

@Injectable()
export class IdentidadeChatService {
  private readonly logger = new Logger(IdentidadeChatService.name);

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Valida o access token do Supabase e devolve a identidade do usuario.
   * Retorna null quando o token e invalido, expirado ou ausente.
   */
  async resolver(token: string | undefined): Promise<IdentidadeChat | null> {
    if (!token) {
      return null;
    }

    const {
      data: { user },
      error,
    } = await this.supabaseService.getClient().auth.getUser(token);

    if (error || !user) {
      this.logger.warn(`Token de chat recusado: ${error?.message ?? 'usuario nao encontrado'}`);
      return null;
    }

    const metadados = (user.user_metadata ?? {}) as Record<string, unknown>;

    return {
      userId: user.id,
      nome: this.extrairNome(metadados, user.email),
      email: user.email ?? null,
      avatarUrl: this.texto(metadados.avatar_url) ?? this.texto(metadados.picture),
      admin: await this.ehAdmin(user.id),
    };
  }

  /**
   * Mesma regra do painel: role 'admin' na tabela profiles. Quem entra pelo
   * login de admin e vai para a live ja chega com os controles na mao.
   */
  private async ehAdmin(userId: string): Promise<boolean> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      this.logger.warn(`Nao foi possivel conferir a role de ${userId}: ${error.message}`);
      return false;
    }

    return data?.role === 'admin';
  }

  private extrairNome(metadados: Record<string, unknown>, email?: string): string {
    const nome =
      this.texto(metadados.full_name) ??
      this.texto(metadados.name) ??
      email?.split('@')[0] ??
      'Participante';

    return nome.slice(0, TAMANHO_MAXIMO_NOME);
  }

  private texto(valor: unknown): string | null {
    return typeof valor === 'string' && valor.trim().length > 0 ? valor.trim() : null;
  }
}
