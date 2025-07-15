import { Module } from '@nestjs/common';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';

@Module({
  controllers: [],
  providers: [MediaService],
  exports: [MediaEntity, MediaService],
})
export class MediaModule {}
