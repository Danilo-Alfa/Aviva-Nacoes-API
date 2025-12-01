import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ApiKeyGuard } from './guards/api-key.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  providers: [
    ApiKeyGuard,
    AdminGuard,
  ],
  exports: [ApiKeyGuard, AdminGuard],
})
export class AuthModule {}
