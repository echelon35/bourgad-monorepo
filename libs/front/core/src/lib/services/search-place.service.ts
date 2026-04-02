import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GeoApiFrProvider, OpenStreetMapProvider } from 'leaflet-geosearch';
import * as L from 'leaflet';
import { firstValueFrom } from 'rxjs';
import { PlaceDto } from '@bourgad-monorepo/external';
import { GeoApiService } from "./geo.api.service";
import { City, ManchePlace } from "@bourgad-monorepo/model";

@Injectable({
  providedIn: 'root'
})
export class SearchPlaceService {

    private readonly geoApiProvider = inject(GeoApiService);
    private readonly http = inject(HttpClient);
    // Par défaut, le contexte géographique est limité à la Manche (Bourgad est exclusivement dans ce département)
    public geographicContext: L.LatLngBounds = L.latLngBounds(
      L.latLng(48.26, -2.15),
      L.latLng(49.93, 1.80)
    );

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
      const provider = new OpenStreetMapProvider({
        params: {
          'accept-language': 'fr',
          addressdetails: 1,
          format: "json",
          countrycodes: "fr",
          limit: 10,
          extratags: 1,
          viewbox: this.geographicContext.toBBoxString(),
          bounded: 1,
        }
      });
      const res = await provider.search({ query: placeToSearch });
      const townList: PlaceDto[] = [];
      res.forEach(cursor => {
        const thisPlace = new PlaceDto();
        thisPlace.copyFromOpenStreetmapProvider(cursor);
        if (thisPlace.latitude && thisPlace.longitude
            && this.geographicContext.contains(L.latLng(thisPlace.latitude, thisPlace.longitude))) {
          townList.push(thisPlace);
        }
      });
      return townList;
    }

    async searchWithIGN(placeToSearch: string): Promise<PlaceDto[]> {
        const params = {
            text: placeToSearch,
            type: 'StreetAddress,PositionOfInterest',
            terr: 50,
            maximumResponses: '10',
        };
        const res = await firstValueFrom(
            this.http.get<{ results: any[] }>('https://data.geopf.fr/geocodage/completion/', { params })
        );
        const townList: PlaceDto[] = [];
        (res?.results ?? []).forEach(item => {
            const place = new PlaceDto();
            place.copyFromIGNProvider(item);
            if (place.latitude && place.longitude) {
                townList.push(place);
            }
        });
        return townList;
    }

    async searchCitiesWithBourgad(placeToSearch: string): Promise<PlaceDto[]> {
        const res = await this.geoApiProvider.searchCityByName(placeToSearch, 50);
        const townList: PlaceDto[] = [];
        res.forEach((thisPlace:City) => {
            const placeDto = new PlaceDto();
            placeDto.copyFromBourgadCity(thisPlace);
            townList.push(placeDto);
        });
        return townList;
    }

    async searchPlacesWithBourgad(placeToSearch: string): Promise<PlaceDto[]> {
        const res = await this.geoApiProvider.searchPlaceByName(placeToSearch);
        const townList: PlaceDto[] = [];
        res.forEach((thisPlace:ManchePlace) => {
            const placeDto = new PlaceDto();
            placeDto.copyFromBourgadPlace(thisPlace);
            townList.push(placeDto);
        });
        return townList;
    }

}