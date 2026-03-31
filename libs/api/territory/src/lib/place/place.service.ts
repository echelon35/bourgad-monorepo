import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PlaceAutocompleteDto } from '@bourgad-monorepo/internal';
import { PlaceEntity } from './place.entity';

@Injectable()
export class PlaceService {
  constructor(private readonly dataSource: DataSource) {}

  async autocomplete(q: string, limit = 10): Promise<PlaceAutocompleteDto[]> {
    const results = await this.dataSource
      .getRepository(PlaceEntity)
      .createQueryBuilder('p')
      .where('p.name ILIKE :q AND p.point is not null', { q: `%${q}%` })
      .orderBy('p.name', 'ASC')
      .limit(limit)
      .getMany();

    return results.map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      lat: p.lat,
      lng: p.lng,
      point: p.point,
    }));
  }
}
