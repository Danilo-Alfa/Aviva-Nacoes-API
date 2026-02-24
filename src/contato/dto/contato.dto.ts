import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, MaxLength } from 'class-validator';

// ─── Request DTOs ─────────────────────────────────────

export class CriarContatoDto {
  @ApiProperty({ description: 'Nome completo', example: 'João da Silva' })
  @IsString()
  @MaxLength(100)
  nome: string;

  @ApiProperty({ description: 'E-mail de contato', example: 'joao@email.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Telefone', example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string | null;

  @ApiProperty({ description: 'Assunto da mensagem', example: 'Dúvida sobre eventos' })
  @IsString()
  @MaxLength(200)
  assunto: string;

  @ApiProperty({ description: 'Mensagem completa' })
  @IsString()
  @MaxLength(5000)
  mensagem: string;
}

// ─── Response DTOs ────────────────────────────────────

export class MensagemContatoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  nome: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  telefone: string | null;

  @ApiProperty()
  assunto: string;

  @ApiProperty()
  mensagem: string;

  @ApiProperty()
  lida: boolean;

  @ApiProperty()
  created_at: string;
}
