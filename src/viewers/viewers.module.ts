import { Module } from '@nestjs/common';
import { ViewersController } from './viewers.controller';
import { ViewersService } from './viewers.service';

@Module({
  controllers: [ViewersController],
  providers: [ViewersService],
  exports: [ViewersService],
})
export class ViewersModule {}
