import { Module } from '@nestjs/common';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { MediaController } from './media.controller';

@Module({
  controllers: [MediaController],
  imports: [TypeOrmModule.forFeature([MediaEntity])],
  providers: [MediaService, StorageService],
  exports: [MediaService, StorageService]
})
export class MediaModule {}
