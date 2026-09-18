import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { IdentidadeChatService } from './identidade.service';
import { ChatController } from './chat.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [ChatController],
  providers: [ChatGateway, ChatService, IdentidadeChatService],
  exports: [ChatService],
})
export class ChatModule {}
