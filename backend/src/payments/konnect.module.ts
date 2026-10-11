import { Module } from '@nestjs/common';
import { FlouciService } from './flouci.service';
import { KonnectService } from './konnect.service';

@Module({
  providers: [KonnectService, FlouciService],
  exports: [KonnectService, FlouciService],
})
export class KonnectModule {}
