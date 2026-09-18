import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class ChatMensagemDto {
  @ApiProperty({ description: 'ID da mensagem' })
  id: string;

  @ApiProperty({ description: 'ID da sessão do viewer' })
  session_id: string;

  @ApiProperty({ description: 'Nome do usuário' })
  nome: string;

  @ApiPropertyOptional({ description: 'Email do usuário' })
  email: string | null;

  @ApiPropertyOptional({ description: 'ID do usuário autenticado (Supabase)' })
  user_id: string | null;

  @ApiPropertyOptional({ description: 'Foto do usuário autenticado' })
  avatar_url: string | null;

  @ApiProperty({ description: 'Conteúdo da mensagem' })
  mensagem: string;

  @ApiProperty({ description: 'Data de criação' })
  created_at: string;
}

export class EnviarMensagemDto {
  @ApiProperty({ description: 'Conteúdo da mensagem' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  mensagem: string;
}

export class JoinChatDto {
  @ApiProperty({ description: 'ID da sessão do viewer' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({
    description:
      'Access token do Supabase. Presente, define a identidade de quem escreve (nome, e-mail e foto vem do Google).',
  })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiPropertyOptional({
    description: 'Nome digitado. Caminho legado do aplicativo, ignorado quando ha token.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nome?: string;

  @ApiPropertyOptional({ description: 'Email do usuário (caminho legado)' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  email?: string;
}

export class NovaMensagemDto {
  @ApiProperty({ description: 'Conteúdo da mensagem' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  mensagem: string;
}

export class DeletarMensagemDto {
  @ApiProperty({ description: 'ID da mensagem' })
  @IsString()
  mensagemId: string;

  @ApiProperty({ description: 'Senha de admin' })
  @IsString()
  adminPassword: string;
}

export class LimparChatDto {
  @ApiProperty({ description: 'Senha de admin' })
  @IsString()
  adminPassword: string;
}
