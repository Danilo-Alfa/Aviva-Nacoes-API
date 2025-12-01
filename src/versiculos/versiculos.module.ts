import { Module } from '@nestjs/common';
import { VersiculosController } from './versiculos.controller';
import { VersiculosService } from './versiculos.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [VersiculosController],
  providers: [VersiculosService],
  exports: [VersiculosService],
})
export class VersiculosModule {}
