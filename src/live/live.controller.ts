import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { LiveService } from './live.service';
import {
  LiveConfigDto,
  UpdateLiveConfigDto,
  IniciarLiveDto,
} from './dto/live-config.dto';
import { RequireApiKey } from '../auth/decorators/api-key.decorator';
import { RequireAdmin } from '../auth/decorators/admin.decorator';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Get('config')
  @ApiOperation({ summary: 'Busca a configuração da live' })
  @ApiResponse({
    status: 200,
    description: 'Configuração retornada com sucesso',
    type: LiveConfigDto,
  })
  async getConfig() {
    return this.liveService.getConfig();
  }

  @Get('status')
  @ApiOperation({ summary: 'Retorna o status atual da live (público)' })
  @ApiResponse({
    status: 200,
    description: 'Status da live',
  })
  async getStatus() {
    return this.liveService.getStatus();
  }

  @Patch('config')
  @RequireAdmin()
  @ApiOperation({ summary: 'Atualiza a configuração da live' })
  @ApiResponse({
    status: 200,
    description: 'Configuração atualizada com sucesso',
    type: LiveConfigDto,
  })
  async updateConfig(@Body() dto: UpdateLiveConfigDto) {
    return this.liveService.updateConfig(dto);
  }

  @Post('iniciar')
  @RequireApiKey()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inicia a transmissão ao vivo (para automação)' })
  @ApiResponse({
    status: 200,
    description: 'Live iniciada com sucesso',
    type: LiveConfigDto,
  })
  async iniciarLive(@Body() dto: IniciarLiveDto) {
    return this.liveService.iniciarLive(dto);
  }

  @Post('parar')
  @RequireApiKey()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Para a transmissão ao vivo (para automação)' })
  @ApiResponse({
    status: 200,
    description: 'Live parada com sucesso',
    type: LiveConfigDto,
  })
  async pararLive() {
    return this.liveService.pararLive();
  }
}
