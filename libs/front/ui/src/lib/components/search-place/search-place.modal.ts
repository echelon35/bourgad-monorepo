
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from "leaflet";
import { EsriProvider, GeoApiFrProvider, OpenStreetMapProvider } from 'leaflet-geosearch';
import { debounceTime, fromEvent, map } from 'rxjs';
import { SpinnerComponent } from '../spinner/spinner.component';
import { CityDto, PlaceDto } from '@bourgad-monorepo/external';
import {GeoApiService} from '@bourgad-monorepo/core';
import { City } from '@bourgad-monorepo/model';

export enum SenseOfResults {
  TOP,
  BOTTOM
}

@Component({
    selector: "bgd-search-place-modal",
    standalone: true,
    templateUrl: './Search-place.modal.html',
    imports: [CommonModule, FormsModule, SpinnerComponent],
})
export class SearchPlace implements OnInit {

    loading = false;

    isVisible = false;
    private wasInside = false;

    public selectedPlace = "";
    public selectedTown?: PlaceDto;
    public filterPlace = "";
    public townList: PlaceDto[] = [];
    @Input() areaMap?: L.Map;
    @Input() zoomLevel = 15;
    @Input() providerType: 'geoApi' | 'openStreetMap' | 'bourgad' = 'geoApi';
    @Input() senseOfResults: SenseOfResults = SenseOfResults.BOTTOM;
    @Input() placeholder = "Vous cherchez un lieu ?";
    @Input() inputClasses = "block rounded-full bg-black hover:bg-gray-800 pl-10 pr-10 py-1.5 text-base text-gray-400 placeholder:text-gray-400 sm:text-sm/6 w-80 truncate";
    @Output() selectedPlace$ = new EventEmitter<PlaceDto>();
    SenseOfResults = SenseOfResults;

    private readonly geoApiService = inject(GeoApiService);

    // acceptedTypes: string[] = [
    //     "administrative",
    //     "volcano", //VOLCANS
    //     "river", //COURS D'EAU
    //     "peak", //MONTAGNE
    //     "mountain_range", //CHAINE DE MONTAGNES
    //     "ocean", //OCEAN
    //     "sea", //MER
    //     "desert", //DESERT
    //     "wood", //BOIS
    //     "attraction" //LIEUX TOURISTIQUES
    // ]

    ngOnInit(){
      const searchBox = document.getElementById('search-country');
      if(searchBox != null){
        const keyup$ = fromEvent(searchBox, 'keyup');
        keyup$.pipe(
              map((i: any) => i.currentTarget.value),
              debounceTime(500)
            )
            .subscribe((val) => {
              console.log(val);
              this.filterPlace = val;
              this.searchPlace();
            });
      }
    }

    show() {
      this.isVisible = true;
    }
  
    close() {
      this.isVisible = false;
    }

    chooseTown(town: PlaceDto){
      this.selectedTown = town;
      this.selectedPlace$.emit(this.selectedTown);
      console.log(town.marker);
      if(town.marker){
        this.locationZoom(town.marker);
      }
      else if(town.boundingbox){
        this.locationZoom(town.boundingbox);
      }

      if(town.name != null){
        this.filterPlace = town.name!;
      }
      this.close();
    }

    clear(){
      this.filterPlace = "";
      this.townList = [];
    }

    @HostListener('focusout')
    focusOut(){
      setTimeout(() => {
        this.close();
      },100);
    }

    searchFromProvider(){
      switch(this.providerType) {
        case 'geoApi':
          this.searchWithGeoApi();
          break;
        case 'openStreetMap':
          this.searchWithOpenStreetMap();
          break;
        case 'bourgad':
          this.searchWithBourgad();
          break;
        default:
          this.searchWithGeoApi();
      }
    }

    searchWithGeoApi(){
      const provider = new GeoApiFrProvider({
        searchUrl: 'https://api-adresse.data.gouv.fr/search',
        reverseUrl: 'https://api-adresse.data.gouv.fr/reverse',
      });
      provider.search({ query: this.filterPlace }).then((res) => {
        console.log(res);
          this.townList = [];
          this.show();
          res.forEach(cursor => {
            const thisPlace = new PlaceDto();
            thisPlace.copyFromGeoApiProvider(cursor);
            this.townList.push(thisPlace);
          })
          this.loading = false;
      });
    }

    searchWithOpenStreetMap(){
      const provider = new OpenStreetMapProvider({
        params: {
          'accept-language': 'fr',
          addressdetails: 1,
          format: "json",
          countrycodes: "fr",
          limit: 100,
          extratags: 1
        }
      });
      provider.search({ query: this.filterPlace }).then((res) => {
        console.log(res);
          this.townList = [];
          this.show();
          res.forEach(cursor => {
            const thisPlace = new PlaceDto();
            thisPlace.copyFromGeoApiProvider(cursor);
            this.townList.push(thisPlace);
          })
          this.loading = false;
      });
    }

    searchWithBourgad(){
      this.geoApiService.searchCityByName(this.filterPlace).subscribe({
        next: (res) => {
          this.townList = [];
          this.show();
          res.forEach((thisPlace:City) => {
            const placeDto = new PlaceDto();
            placeDto.copyFromBourgad(thisPlace);
            this.townList.push(placeDto);
          })
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
    }

    searchPlace(){
      this.loading = true;
      this.townList = [];
      this.searchFromProvider();
  
    }

    locationZoom(location: L.LatLngBounds | L.Marker){
      if(this.areaMap !== undefined){
          if(location instanceof L.LatLngBounds){
            this.areaMap.flyToBounds(location);
          }
          else{
            this.areaMap.addLayer(location);
            this.areaMap.flyTo(location.getLatLng(),this.zoomLevel);
          }
      }
    }

}