import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  RegisterTokenDto,
  SendNotificationDto,
  PushTokenDto,
  SendNotificationResponseDto,
} from './dto/notification.dto';
import { RequireAdmin } from '../auth/decorators/admin.decorator';
import { RequireApiKey } from '../auth/decorators/api-key.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post('register-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Registra um push token do dispositivo' })
  @ApiResponse({
    status: 200,
    description: 'Token registrado com sucesso',
    type: PushTokenDto,
  })
  async registerToken(@Body() dto: RegisterTokenDto) {
    return this.notificationsService.registerToken(dto);
  }

  @Post('send-live-started')
  @RequireAdmin()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Envia notificacao de live iniciada para todos os dispositivos' })
  @ApiResponse({
    status: 200,
    description: 'Notificacoes enviadas',
    type: SendNotificationResponseDto,
  })
  async sendLiveStarted(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendLiveStartedNotification(
      dto.titulo,
      dto.mensagem,
    );
  }

  @Get('stats')
  @RequireAdmin()
  @ApiOperation({ summary: 'Estatisticas de tokens registrados' })
  @ApiResponse({
    status: 200,
    description: 'Estatisticas retornadas com sucesso',
  })
  async getStats() {
    return this.notificationsService.getStats();
  }

  @Delete('cleanup')
  @RequireApiKey()
  @ApiOperation({ summary: 'Desativa tokens inativos (mais de 30 dias)' })
  @ApiResponse({
    status: 200,
    description: 'Tokens limpos com sucesso',
  })
  async cleanup() {
    const count = await this.notificationsService.cleanupStaleTokens();
    return { desativados: count };
  }
}
