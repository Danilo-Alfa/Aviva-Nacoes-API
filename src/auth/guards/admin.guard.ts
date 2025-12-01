import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const adminPassword = request.headers['x-admin-password'];

    const validPassword = this.configService.get<string>('ADMIN_PASSWORD');

    if (!validPassword) {
      throw new UnauthorizedException(
        'Senha de admin não configurada no servidor',
      );
    }

    if (!adminPassword || adminPassword !== validPassword) {
      throw new UnauthorizedException('Senha de admin inválida');
    }

    return true;
  }
}
