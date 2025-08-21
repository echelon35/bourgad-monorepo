import { DataSource } from 'typeorm';
import { MediaDto } from '@bourgad-monorepo/internal';
import { Injectable } from '@nestjs/common';
import { Media } from '@bourgad-monorepo/model';
import { MediaEntity } from './media.entity';

@Injectable()
export class MediaService {
  constructor(
    private dataSource: DataSource
  ) {}

  async findAll(): Promise<Media[]> {
    return await this.dataSource.getRepository(MediaEntity).find();
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.dataSource.getRepository(MediaEntity).findOne({ where: { mediaId: id } });
    if (!media) {
      throw new Error(`Media with id ${id} not found`);
    }
    return media;
  }

  async create(mediaDto: MediaDto): Promise<Media> {
    return this.dataSource.getRepository(MediaEntity).manager.transaction(async (manager) => {
      return manager.save(MediaEntity, mediaDto);
    });
  }

  async update(id: number, mediaDto: MediaDto): Promise<Media> {
    await this.dataSource.getRepository(MediaEntity).update(id, mediaDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.dataSource.getRepository(MediaEntity).delete(id);
  }
}