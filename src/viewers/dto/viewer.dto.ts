import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ViewerDto {
  @ApiProperty({ description: 'ID do viewer' })
  id: string;

  @ApiProperty({ description: 'ID da sessão' })
  session_id: string;

  @ApiPropertyOptional({ description: 'Nome do viewer' })
  nome: string | null;

  @ApiPropertyOptional({ description: 'Email do viewer' })
  email: string | null;

  @ApiPropertyOptional({ description: 'IP do viewer' })
  ip_address: string | null;

  @ApiPropertyOptional({ description: 'User agent do navegador' })
  user_agent: string | null;

  @ApiProperty({ description: 'Data de entrada' })
  entrou_em: string;

  @ApiProperty({ description: 'Última atividade' })
  ultima_atividade: string;

  @ApiProperty({ description: 'Se está assistindo ativamente' })
  assistindo: boolean;
}

export class RegistrarViewerDto {
  @ApiProperty({ description: 'ID da sessão' })
  @IsString()
  session_id: string;

  @ApiPropertyOptional({ description: 'Nome do viewer' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome?: string;

  @ApiPropertyOptional({ description: 'Email do viewer' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ description: 'User agent do navegador' })
  @IsOptional()
  @IsString()
  user_agent?: string;
}

export class HeartbeatDto {
  @ApiProperty({ description: 'ID da sessão' })
  @IsString()
  session_id: string;
}

export class ViewerStatsDto {
  @ApiProperty({ description: 'Número de viewers ativos' })
  viewers_ativos: number;

  @ApiProperty({ description: 'Total de registros' })
  total_registros: number;

  @ApiPropertyOptional({ description: 'Primeiro viewer' })
  primeiro_viewer: string | null;

  @ApiPropertyOptional({ description: 'Último viewer' })
  ultimo_viewer: string | null;
}
