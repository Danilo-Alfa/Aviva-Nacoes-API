import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { LiveModule } from './live/live.module';
import { ChatModule } from './chat/chat.module';
import { ViewersModule } from './viewers/viewers.module';
import { AuthModule } from './auth/auth.module';
import { VersiculosModule } from './versiculos/versiculos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
    LiveModule,
    ChatModule,
    ViewersModule,
    VersiculosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
