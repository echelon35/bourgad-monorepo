import { Module } from '@nestjs/common';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailModule } from '@bourgad-monorepo/mail';

@Module({
  controllers: [],
  imports: [TypeOrmModule.forFeature([MediaEntity]), MailModule],
  providers: [MediaService],
  exports: [MediaService]
})
export class MediaModule {}
