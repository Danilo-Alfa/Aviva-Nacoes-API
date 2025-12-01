import { Module } from '@nestjs/common';
import { JornaisController } from './jornais.controller';
import { JornaisService } from './jornais.service';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [JornaisController],
  providers: [JornaisService],
  exports: [JornaisService],
})
export class JornaisModule {}
