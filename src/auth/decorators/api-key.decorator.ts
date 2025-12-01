import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';
import { ApiKeyGuard } from '../guards/api-key.guard';

export function RequireApiKey() {
  return applyDecorators(UseGuards(ApiKeyGuard), ApiSecurity('api-key'));
}
