import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUrl,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';

export class CriarVersiculoDto {
  @ApiProperty({
    description: 'URL da imagem do versículo',
    example: 'https://scontent.fxxx.fbcdn.net/v/...',
  })
  @IsUrl()
  url_imagem: string;

  @ApiPropertyOptional({
    description: 'URL do post do Facebook com o versículo',
    example:
      'https://www.facebook.com/photo?fbid=25344157145195700&set=a.292699170768177',
  })
  @IsOptional()
  @IsUrl()
  url_post?: string;
}

export class VersiculoDto {
  @ApiProperty({ description: 'ID do versículo' })
  id: string;

  @ApiProperty({ description: 'URL do post' })
  url_post: string;

  @ApiProperty({ description: 'URL da imagem do versículo' })
  url_imagem: string;

  @ApiPropertyOptional({ description: 'Título do versículo' })
  titulo: string | null;

  @ApiProperty({ description: 'Data do versículo' })
  data: string;

  @ApiProperty({ description: 'Se o versículo está ativo' })
  ativo: boolean;

  @ApiProperty({ description: 'Data de criação' })
  created_at: string;
}
