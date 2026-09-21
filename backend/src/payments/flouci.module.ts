import { Module } from '@nestjs/common';
import { FlouciService } from './flouci.service';

@Module({
  providers: [FlouciService],
  exports: [FlouciService],
})
export class FlouciModule {}
