import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContatoService } from './contato.service';
import { CriarContatoDto, MensagemContatoDto } from './dto/contato.dto';

@ApiTags('contato')
@Controller('contato')
export class ContatoController {
  constructor(private readonly contatoService: ContatoService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Envia uma mensagem de contato e notifica via WhatsApp' })
  @ApiResponse({
    status: 201,
    description: 'Mensagem salva e notificação enviada',
    type: MensagemContatoDto,
  })
  async criar(@Body() dto: CriarContatoDto) {
    return this.contatoService.criar(dto);
  }
}
