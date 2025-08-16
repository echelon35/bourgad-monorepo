import { InjectRepository } from '@nestjs/typeorm';
import { MediaEntity } from './media.entity';
import { Repository } from 'typeorm';
import { MediaDto } from '@bourgad-monorepo/internal';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity) private mediaRepository: Repository<MediaEntity>
  ) {}

  async findAll(): Promise<MediaEntity[]> {
    return await this.mediaRepository.find();
  }

  async findOne(id: number): Promise<MediaEntity> {
    const media = await this.mediaRepository.findOne({ where: { mediaId: id } });
    if (!media) {
      throw new Error(`Media with id ${id} not found`);
    }
    return media;
  }

  async create(mediaDto: MediaDto): Promise<MediaEntity> {
    const media = this.mediaRepository.create(mediaDto);
    return await this.mediaRepository.save(media);
  }

  async update(id: number, mediaDto: MediaDto): Promise<MediaEntity> {
    await this.mediaRepository.update(id, mediaDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.mediaRepository.delete(id);
  }
}