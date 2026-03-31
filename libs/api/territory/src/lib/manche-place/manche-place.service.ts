import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ManchePlaceAutocompleteDto } from '@bourgad-monorepo/internal';
import { ManchePlaceEntity } from './manche-place.entity';

@Injectable()
export class ManchePlaceService {
  constructor(private readonly dataSource: DataSource) {}

  async autocomplete(q: string, limit = 10): Promise<ManchePlaceAutocompleteDto[]> {
    const results = await this.dataSource
      .getRepository(ManchePlaceEntity)
      .createQueryBuilder('p')
      .where('p.name ILIKE :q', { q: `%${q}%` })
      .orderBy('p.name', 'ASC')
      .limit(limit)
      .getMany();

    return results.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      lat: p.lat,
      lng: p.lng,
    }));
  }
}
