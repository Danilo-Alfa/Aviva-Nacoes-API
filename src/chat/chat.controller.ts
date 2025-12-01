import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { ChatMensagemDto } from './dto/chat.dto';
import { RequireAdmin } from '../auth/decorators/admin.decorator';
import { RequireApiKey } from '../auth/decorators/api-key.decorator';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('mensagens')
  @ApiOperation({ summary: 'Busca as últimas mensagens do chat' })
  @ApiResponse({
    status: 200,
    description: 'Mensagens retornadas com sucesso',
    type: [ChatMensagemDto],
  })
  async getMensagens() {
    return this.chatService.getMensagens();
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Retorna estatísticas do chat' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas retornadas com sucesso',
  })
  async getEstatisticas() {
    return this.chatService.getEstatisticas();
  }

  @Delete('mensagem/:id')
  @RequireAdmin()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deleta uma mensagem específica' })
  @ApiParam({ name: 'id', description: 'ID da mensagem' })
  @ApiResponse({
    status: 204,
    description: 'Mensagem deletada com sucesso',
  })
  async deletarMensagem(@Param('id') id: string) {
    await this.chatService.deletarMensagem(id);
  }

  @Post('limpar')
  @RequireApiKey()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Limpa todas as mensagens do chat (para automação)',
  })
  @ApiResponse({
    status: 204,
    description: 'Chat limpo com sucesso',
  })
  async limparChat() {
    await this.chatService.limparChat();
  }
}
