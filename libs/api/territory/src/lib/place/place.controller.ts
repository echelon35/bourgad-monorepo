import { Controller, Get, Query } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceAutocompleteDto } from '@bourgad-monorepo/internal';
import { Public } from '@bourgad-monorepo/api/core';

@Controller('geo/places')
export class PlaceController {
  constructor(private readonly manchePlaceService: PlaceService) {}

  @Get('autocomplete')
  @Public()
  async autocomplete(
    @Query('q') q: string,
    @Query('limit') limit?: string,
  ): Promise<PlaceAutocompleteDto[]> {
    if (!q || q.trim().length < 2) return [];
    return this.manchePlaceService.autocomplete(q.trim(), limit ? Math.min(Number(limit), 50) : 10);
  }
}
