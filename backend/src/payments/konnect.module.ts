import { Module } from '@nestjs/common';
import { KonnectService } from './konnect.service';

@Module({
  providers: [KonnectService],
  exports: [KonnectService],
})
export class KonnectModule {}
