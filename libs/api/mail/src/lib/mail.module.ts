import { Module } from '@nestjs/common';
import { EmailerService } from './emailer.service';

@Module({
  controllers: [],
  providers: [EmailerService],
  exports: [EmailerService],
})
export class MailModule {}
