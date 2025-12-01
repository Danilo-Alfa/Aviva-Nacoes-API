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
import { JornaisService } from './jornais.service';
import {
  CriarJornalDto,
  AtualizarJornalDto,
  JornalDto,
} from './dto/jornal.dto';
import { RequireApiKey } from '../auth/decorators/api-key.decorator';
import { RequireAdmin } from '../auth/decorators/admin.decorator';

@ApiTags('jornais')
@Controller('jornais')
export class JornaisController {
  constructor(private readonly jornaisService: JornaisService) {}

  @Post()
  @RequireApiKey()
  @ApiOperation({ summary: 'Cria um novo jornal (para automação via n8n)' })
  @ApiResponse({
    status: 201,
    description: 'Jornal criado com sucesso',
    type: JornalDto,
  })
  async criar(@Body() dto: CriarJornalDto) {
    return this.jornaisService.criar(dto.url, dto.titulo);
  }

  @Get('ultimos')
  @ApiOperation({ summary: 'Busca os últimos jornais (página pública)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de resultados (padrão: 5)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista dos últimos jornais',
    type: [JornalDto],
  })
  async getUltimos(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 5;
    return this.jornaisService.getUltimos(limitNumber);
  }

  @Get()
  @RequireAdmin()
  @ApiOperation({ summary: 'Lista todos os jornais (admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos os jornais',
    type: [JornalDto],
  })
  async getTodos() {
    return this.jornaisService.getTodos();
  }

  @Patch(':id')
  @RequireAdmin()
  @ApiOperation({ summary: 'Atualiza um jornal (admin)' })
  @ApiParam({ name: 'id', description: 'ID do jornal' })
  @ApiResponse({
    status: 200,
    description: 'Jornal atualizado',
    type: JornalDto,
  })
  async atualizar(@Param('id') id: string, @Body() body: AtualizarJornalDto) {
    return this.jornaisService.atualizar(
      id,
      body.url_pdf,
      body.titulo || null,
      body.data,
    );
  }

  @Delete(':id')
  @RequireAdmin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deleta um jornal (admin)' })
  @ApiParam({ name: 'id', description: 'ID do jornal' })
  @ApiResponse({
    status: 200,
    description: 'Jornal deletado',
  })
  async deletar(@Param('id') id: string) {
    return this.jornaisService.deletar(id);
  }
}
