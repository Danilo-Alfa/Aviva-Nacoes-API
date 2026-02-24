import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

// ─── Request DTOs ─────────────────────────────────────

export class RegisterTokenDto {
  @ApiProperty({ description: 'Expo push token', example: 'ExponentPushToken[xxxxxx]' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Plataforma do dispositivo', enum: ['ios', 'android'] })
  @IsString()
  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';

  @ApiPropertyOptional({ description: 'Nome do dispositivo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  device_name?: string | null;

  @ApiPropertyOptional({ description: 'Versao do app' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  app_version?: string;
}

export class SendNotificationDto {
  @ApiProperty({ description: 'Titulo da notificacao' })
  @IsString()
  @MaxLength(200)
  titulo: string;

  @ApiPropertyOptional({ description: 'Corpo da notificacao' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  mensagem?: string;
}

// ─── Response DTOs ────────────────────────────────────

export class PushTokenDto {
  @ApiProperty({ description: 'ID do registro' })
  id: string;

  @ApiProperty({ description: 'Expo push token' })
  token: string;

  @ApiProperty({ description: 'Plataforma' })
  platform: string;

  @ApiPropertyOptional({ description: 'Nome do dispositivo' })
  device_name: string | null;

  @ApiPropertyOptional({ description: 'Versao do app' })
  app_version: string | null;

  @ApiProperty({ description: 'Token ativo' })
  ativo: boolean;

  @ApiProperty({ description: 'Data de criacao' })
  created_at: string;

  @ApiProperty({ description: 'Data de atualizacao' })
  updated_at: string;
}

export class SendNotificationResponseDto {
  @ApiProperty({ description: 'Notificacoes enviadas com sucesso' })
  enviados: number;

  @ApiProperty({ description: 'Notificacoes com falha' })
  falhas: number;

  @ApiProperty({ description: 'Tokens desativados (dispositivos desinstalados)' })
  desativados: number;
}
