import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Autoriza acoes administrativas.
 *
 * Caminho principal: JWT do Supabase via "Authorization: Bearer <token>".
 * O token vem da sessao do admin logado no frontend (Supabase Auth); o guard
 * valida a sessao e confere role = 'admin' na tabela profiles.
 *
 * Caminho legado (transicao): header "x-admin-password" comparado com a env
 * ADMIN_PASSWORD. Fica ativo apenas enquanto a env existir — remover a env
 * ADMIN_PASSWORD do servidor desativa esse caminho definitivamente.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader: string | undefined = request.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return this.validarTokenAdmin(authHeader.slice('Bearer '.length));
    }

    const adminPassword = request.headers['x-admin-password'];
    const validPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (validPassword && adminPassword === validPassword) {
      return true;
    }

    throw new UnauthorizedException('Credenciais de admin inválidas');
  }

  private async validarTokenAdmin(token: string): Promise<boolean> {
    const supabase = this.supabaseService.getClient();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      throw new UnauthorizedException(
        'Apenas administradores podem executar esta ação',
      );
    }

    return true;
  }
}
