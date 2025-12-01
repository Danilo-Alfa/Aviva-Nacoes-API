import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class LiveConfigDto {
  @ApiProperty({ description: 'ID da configuração' })
  id: string;

  @ApiProperty({ description: 'Se a live está ativa' })
  ativa: boolean;

  @ApiPropertyOptional({ description: 'URL do stream' })
  url_stream: string | null;

  @ApiProperty({ description: 'Título da live' })
  titulo: string;

  @ApiPropertyOptional({ description: 'Descrição da live' })
  descricao: string | null;

  @ApiProperty({ description: 'Mensagem quando offline' })
  mensagem_offline: string;

  @ApiPropertyOptional({ description: 'Título da próxima live' })
  proxima_live_titulo: string | null;

  @ApiPropertyOptional({ description: 'Data da próxima live' })
  proxima_live_data: string | null;

  @ApiPropertyOptional({ description: 'Descrição da próxima live' })
  proxima_live_descricao: string | null;

  @ApiProperty({ description: 'Mostrar contador de viewers' })
  mostrar_contador_viewers: boolean;

  @ApiProperty({ description: 'Cor do badge' })
  cor_badge: string;

  @ApiProperty({ description: 'Data de criação' })
  created_at: string;

  @ApiProperty({ description: 'Data de atualização' })
  updated_at: string;
}

export class UpdateLiveConfigDto {
  @ApiPropertyOptional({ description: 'Se a live está ativa' })
  @IsOptional()
  @IsBoolean()
  ativa?: boolean;

  @ApiPropertyOptional({ description: 'URL do stream' })
  @IsOptional()
  @IsString()
  url_stream?: string | null;

  @ApiPropertyOptional({ description: 'Título da live' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  titulo?: string;

  @ApiPropertyOptional({ description: 'Descrição da live' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string | null;

  @ApiPropertyOptional({ description: 'Mensagem quando offline' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  mensagem_offline?: string;

  @ApiPropertyOptional({ description: 'Título da próxima live' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  proxima_live_titulo?: string | null;

  @ApiPropertyOptional({ description: 'Data da próxima live' })
  @IsOptional()
  @IsString()
  proxima_live_data?: string | null;

  @ApiPropertyOptional({ description: 'Descrição da próxima live' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  proxima_live_descricao?: string | null;

  @ApiPropertyOptional({ description: 'Mostrar contador de viewers' })
  @IsOptional()
  @IsBoolean()
  mostrar_contador_viewers?: boolean;

  @ApiPropertyOptional({ description: 'Cor do badge' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  cor_badge?: string;
}

export class IniciarLiveDto {
  @ApiProperty({ description: 'URL do stream' })
  @IsString()
  url_stream: string;

  @ApiProperty({ description: 'Título da live' })
  @IsString()
  @MaxLength(200)
  titulo: string;

  @ApiPropertyOptional({ description: 'Descrição da live' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descricao?: string;
}
