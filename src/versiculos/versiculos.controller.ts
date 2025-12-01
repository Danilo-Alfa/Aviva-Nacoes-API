import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { VersiculosService } from './versiculos.service';
import { CriarVersiculoDto, VersiculoDto } from './dto/versiculo.dto';
import { RequireAdmin } from '../auth/decorators/admin.decorator';

@ApiTags('versiculos')
@Controller('versiculos')
export class VersiculosController {
  constructor(private readonly versiculosService: VersiculosService) {}

  @Post()
  @RequireAdmin()
  @ApiOperation({ summary: 'Cria um novo versículo' })
  @ApiResponse({
    status: 201,
    description: 'Versículo criado com sucesso',
    type: VersiculoDto,
  })
  async criar(@Body() dto: CriarVersiculoDto) {
    return this.versiculosService.criar(dto.url);
  }

  @Get('hoje')
  @ApiOperation({ summary: 'Busca o versículo do dia (mais recente ativo)' })
  @ApiResponse({
    status: 200,
    description: 'Versículo do dia',
    type: VersiculoDto,
  })
  async getVersiculoDoDia() {
    return this.versiculosService.getVersiculoDoDia();
  }

  @Get('anteriores')
  @ApiOperation({ summary: 'Busca versículos anteriores' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limite de resultados (padrão: 6)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de versículos anteriores',
    type: [VersiculoDto],
  })
  async getVersiculosAnteriores(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 6;
    return this.versiculosService.getVersiculosAnteriores(limitNumber);
  }

  @Get()
  @RequireAdmin()
  @ApiOperation({ summary: 'Lista todos os versículos (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os versículos',
    type: [VersiculoDto],
  })
  async getTodos() {
    return this.versiculosService.getTodos();
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Atualiza um versículo (admin)' })
  @ApiParam({ name: 'id', description: 'ID do versículo' })
  @ApiResponse({
    status: 200,
    description: 'Versículo atualizado',
    type: VersiculoDto,
  })
  async atualizar(
    @Param('id') id: string,
    @Body() body: { url_post: string; titulo: string | null; data: string },
  ) {
    return this.versiculosService.atualizar(id, body.url_post, body.titulo, body.data);
  }

  @Patch(':id/toggle')
  @RequireAdmin()
  @ApiOperation({ summary: 'Ativa/desativa um versículo (admin)' })
  @ApiParam({ name: 'id', description: 'ID do versículo' })
  @ApiResponse({
    status: 200,
    description: 'Status atualizado',
    type: VersiculoDto,
  })
  async toggleAtivo(
    @Param('id') id: string,
    @Body() body: { ativo: boolean },
  ) {
    return this.versiculosService.toggleAtivo(id, body.ativo);
  }

  @Delete(':id')
  @RequireAdmin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deleta um versículo (admin)' })
  @ApiParam({ name: 'id', description: 'ID do versículo' })
  @ApiResponse({
    status: 200,
    description: 'Versículo deletado',
  })
  async deletar(@Param('id') id: string) {
    return this.versiculosService.deletar(id);
  }
}
