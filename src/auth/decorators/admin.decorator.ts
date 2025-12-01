import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { AdminGuard } from '../guards/admin.guard';

export function RequireAdmin() {
  return applyDecorators(UseGuards(AdminGuard), ApiSecurity('admin-password'));
}
