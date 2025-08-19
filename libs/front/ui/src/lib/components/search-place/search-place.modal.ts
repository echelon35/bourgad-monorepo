
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, HostListener, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as L from "leaflet";
import { debounceTime, fromEvent, map, Observable, Subscription } from 'rxjs';
import { SpinnerComponent } from '../spinner/spinner.component';
import { PlaceDto } from '@bourgad-monorepo/external';
import { SearchPlaceService, selectUser } from '@bourgad-monorepo/core';
import { MapService } from '../../services/map.service';
import { City } from '@bourgad-monorepo/model';
import { Store } from '@ngrx/store';

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
export class SearchPlace implements OnInit, OnDestroy, AfterViewInit {

    loading = false;
    //Results visibility
    isVisible = false;
    public selectedTown?: PlaceDto;
    public filterPlace = "";
    public townList: PlaceDto[] = [];
    areaMap?: L.Map;
    searchPlaceLayer = new L.LayerGroup();
    SenseOfResults: typeof SenseOfResults = SenseOfResults;
    userCity$: Observable<City | undefined>;

    //Level of zoom when clicking on result
    @Input() zoomLevel = 15;
    //Type of provider to use for search
    @Input() providerType: 'geoApi' | 'openStreetMap' | 'bourgad' = 'geoApi';
    //Results on top or bottom of the input
    @Input() senseOfResults: SenseOfResults = SenseOfResults.BOTTOM;
    @Input() placeholder = "Vous cherchez un lieu ?";
    @Input() inputClasses = "block rounded-full bg-black hover:bg-gray-800 pl-10 pr-10 py-1.5 text-base text-gray-400 placeholder:text-gray-400 sm:text-sm/6 w-80 truncate";
    //Id of the searchPlace (useful when several components in the same view)
    @Input() mapId = 'bgd';
    @Input() useGeographicContext = false;
    
    @Output() selectedPlace$ = new EventEmitter<PlaceDto>();

    private readonly searchPlaceService = inject(SearchPlaceService);
    private readonly mapService = inject(MapService);
    private mapSubscription!: Subscription;
    private readonly store = inject(Store);

    constructor(){
      this.userCity$ = this.store.select(selectUser).pipe(map(user => user?.city));
    }

    ngOnInit(): void {
      //Wait map initialization before using map from service
      this.mapSubscription = this.mapService.getMap(this.mapId).subscribe(map => {
        if (map) {
          this.areaMap = map;
        }
      });
      if (this.userCity$ != null && this.useGeographicContext) {
        this.userCity$.subscribe(city => {
          if (!city || !city.surface) {
            return;
          }
          const cityLayer = L.geoJSON(city.surface);
          this.searchPlaceService.geographicContext = cityLayer.getBounds();
        });
      }
    }

    ngAfterViewInit(): void {
      const searchBox = document.getElementById(this.mapId + '-search-country') as HTMLInputElement;
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

    ngOnDestroy(): void {
      this.mapSubscription.unsubscribe();
    }

    showResults() {
      this.isVisible = true;
    }
  
    closeResults() {
      this.isVisible = false;
    }

    chooseTown(town: PlaceDto){
      this.selectedTown = town;
      this.selectedPlace$.emit(this.selectedTown);
      console.log(town.marker);
      if(town.marker){
        const marker = new L.Marker(town.marker.getLatLng(), {
          icon: L.icon({
            iconUrl: 'assets/markers/default_bourgad.svg',
            iconSize: [50, 82],
            iconAnchor: [25, 82],
          })
        });
        this.locationZoom(marker);
      }
      
      if(town.boundingbox){
        this.locationZoom(town.boundingbox);
      }

      if(town.name != null){
        this.filterPlace = town?.name;
      }
      this.closeResults();
    }

    clear(){
      this.filterPlace = "";
      this.townList = [];
      this.searchPlaceLayer.clearLayers();
    }

    @HostListener('focusout')
    focusOut(){
      setTimeout(() => {
        this.closeResults();
      },100);
    }

    async searchFromProvider(searchedPlace: string){
      console.log(this.providerType)
      this.loading = true;
      switch(this.providerType) {
        case 'geoApi':
          this.townList = await this.searchPlaceService.searchWithGeoApi(searchedPlace);
          break;
        case 'openStreetMap':
          this.townList = await this.searchPlaceService.searchWithOpenStreetMap(searchedPlace);
          break;
        case 'bourgad':
          this.townList = await this.searchPlaceService.searchWithBourgad(searchedPlace);
          break;
        default:
          this.townList = await this.searchPlaceService.searchWithGeoApi(searchedPlace);
      }
      this.loading = false;
      this.showResults();
    }

    searchPlace(){
      this.loading = true;
      this.townList = [];
      this.searchFromProvider(this.filterPlace);
    }

    locationZoom(location: L.LatLngBounds | L.Marker){
      if(this.areaMap !== undefined){
          if(location instanceof L.LatLngBounds){
            this.areaMap.flyToBounds(location);
          }
          else{
            this.searchPlaceLayer.clearLayers();
            this.searchPlaceLayer.addLayer(location);
            this.areaMap.addLayer(this.searchPlaceLayer);
            this.areaMap.flyTo(location.getLatLng(),this.zoomLevel);
          }
      }
    }

}