import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUrl, IsOptional, IsString } from 'class-validator';

export class CriarJornalDto {
  @ApiProperty({
    description: 'URL do PDF do jornal',
    example: 'https://drive.google.com/file/d/xxx/view',
  })
  @IsUrl()
  url: string;

  @ApiPropertyOptional({
    description: 'Título do jornal (opcional para automação)',
    example: 'Jornal Aviva Nações - Dezembro 2024',
  })
  @IsOptional()
  @IsString()
  titulo?: string;
}

export class AtualizarJornalDto {
  @ApiProperty({ description: 'URL do PDF do jornal' })
  @IsUrl()
  url_pdf: string;

  @ApiPropertyOptional({ description: 'Título do jornal' })
  @IsOptional()
  @IsString()
  titulo?: string | null;

  @ApiProperty({ description: 'Data do jornal (YYYY-MM-DD)' })
  @IsString()
  data: string;
}

export class JornalDto {
  @ApiProperty({ description: 'ID do jornal' })
  id: string;

  @ApiProperty({ description: 'URL do PDF' })
  url_pdf: string;

  @ApiPropertyOptional({ description: 'Título do jornal' })
  titulo: string | null;

  @ApiProperty({ description: 'Data do jornal' })
  data: string;

  @ApiProperty({ description: 'Data de criação' })
  created_at: string;
}
