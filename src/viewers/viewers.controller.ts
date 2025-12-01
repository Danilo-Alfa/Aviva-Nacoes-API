import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ViewersService } from './viewers.service';
import {
  ViewerDto,
  RegistrarViewerDto,
  HeartbeatDto,
  ViewerStatsDto,
} from './dto/viewer.dto';
import { RequireAdmin } from '../auth/decorators/admin.decorator';
import { RequireApiKey } from '../auth/decorators/api-key.decorator';

@ApiTags('viewers')
@Controller('viewers')
export class ViewersController {
  constructor(private readonly viewersService: ViewersService) {}

  @Post('registrar')
  @ApiOperation({ summary: 'Registra um novo viewer ou atualiza existente' })
  @ApiResponse({
    status: 201,
    description: 'Viewer registrado com sucesso',
    type: ViewerDto,
  })
  async registrar(@Body() dto: RegistrarViewerDto) {
    return this.viewersService.registrarViewer(dto);
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualiza o heartbeat do viewer' })
  @ApiResponse({
    status: 200,
    description: 'Heartbeat atualizado',
  })
  async heartbeat(@Body() dto: HeartbeatDto) {
    return this.viewersService.atualizarHeartbeat(dto.session_id);
  }

  @Post('sair')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Marca o viewer como não assistindo' })
  @ApiResponse({
    status: 200,
    description: 'Viewer saiu da live',
  })
  async sair(@Body() dto: HeartbeatDto) {
    return this.viewersService.sairDaLive(dto.session_id);
  }

  @Get('contagem')
  @ApiOperation({ summary: 'Retorna o número de viewers ativos' })
  @ApiResponse({
    status: 200,
    description: 'Contagem de viewers',
  })
  async contagem() {
    const count = await this.viewersService.contarViewersAtivos();
    return { viewers: count };
  }

  @Get('ativos')
  @RequireAdmin()
  @ApiOperation({ summary: 'Lista todos os viewers ativos (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de viewers ativos',
    type: [ViewerDto],
  })
  async getAtivos() {
    return this.viewersService.getViewersAtivos();
  }

  @Get('todos')
  @RequireAdmin()
  @ApiOperation({ summary: 'Lista todos os viewers (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os viewers',
    type: [ViewerDto],
  })
  async getTodos() {
    return this.viewersService.getTodosViewers();
  }

  @Get('estatisticas')
  @ApiOperation({ summary: 'Retorna estatísticas dos viewers' })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas dos viewers',
    type: ViewerStatsDto,
  })
  async getEstatisticas() {
    return this.viewersService.getEstatisticas();
  }

  @Get(':sessionId')
  @ApiOperation({ summary: 'Busca um viewer pelo sessionId' })
  @ApiParam({ name: 'sessionId', description: 'ID da sessão' })
  @ApiResponse({
    status: 200,
    description: 'Viewer encontrado',
    type: ViewerDto,
  })
  async getViewer(@Param('sessionId') sessionId: string) {
    return this.viewersService.getViewer(sessionId);
  }

  @Delete('inativos')
  @RequireApiKey()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove viewers inativos (para automação)' })
  @ApiResponse({
    status: 200,
    description: 'Viewers inativos removidos',
  })
  async limparInativos() {
    const removidos = await this.viewersService.limparViewersInativos();
    return { removidos };
  }
}
