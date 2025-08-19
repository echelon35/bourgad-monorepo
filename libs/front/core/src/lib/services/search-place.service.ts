import { inject, Injectable } from "@angular/core";
import { GeoApiFrProvider, OpenStreetMapProvider } from 'leaflet-geosearch';
import { PlaceDto } from '@bourgad-monorepo/external';
import { GeoApiService } from "./geo.api.service";
import { City } from "@bourgad-monorepo/model";

@Injectable({
  providedIn: 'root'
})
export class SearchPlaceService {

    private readonly geoApiProvider = inject(GeoApiService)
    public geographicContext: L.LatLngBounds | undefined;

    async searchWithGeoApi(placeToSearch: string): Promise<PlaceDto[]> {
      const provider = new GeoApiFrProvider({
        searchUrl: 'https://api-adresse.data.gouv.fr/search',
        reverseUrl: 'https://api-adresse.data.gouv.fr/reverse',
      });
      const res = await provider.search({ query: placeToSearch });
      const townList: PlaceDto[] = [];
      res.forEach(cursor => {
        const thisPlace = new PlaceDto();
        thisPlace.copyFromGeoApiProvider(cursor);
        townList.push(thisPlace);
      });
      return townList;
    }

    async searchWithOpenStreetMap(placeToSearch: string): Promise<PlaceDto[]> {
      console.log(this.geographicContext);
      const provider = new OpenStreetMapProvider({
        params: {
          'accept-language': 'fr',
          addressdetails: 1,
          format: "json",
          countrycodes: "fr",
          limit: 10,
          extratags: 1,
          viewbox: (this.geographicContext) ? this.geographicContext.toBBoxString() : '-180,-90,180,90'
        }
      });
      const res = await provider.search({ query: placeToSearch });
      const townList: PlaceDto[] = [];
      res.forEach(cursor => {
        const thisPlace = new PlaceDto();
        thisPlace.copyFromOpenStreetmapProvider(cursor);
        townList.push(thisPlace);
      });
      return townList;
    }

    async searchWithBourgad(placeToSearch: string): Promise<PlaceDto[]> {
        const res = await this.geoApiProvider.searchCityByName(placeToSearch);
        const townList: PlaceDto[] = [];
        res.forEach((thisPlace:City) => {
            const placeDto = new PlaceDto();
            placeDto.copyFromBourgad(thisPlace);
            townList.push(placeDto);
        });
        return townList;
    }

}