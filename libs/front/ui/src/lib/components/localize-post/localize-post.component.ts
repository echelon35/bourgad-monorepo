import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from "@angular/core";
import { City } from "@bourgad-monorepo/model";
import L from "leaflet";
import { Subscription } from "rxjs";
import { SearchPlace } from "../search-place/search-place.modal";
import { MapComponent } from "../map/map.component";
import { MapService } from "../../services/map.service";
import { PlaceDto } from "@bourgad-monorepo/external";
import { UserStore } from "@bourgad-monorepo/core";

@Component({
  selector: "bgd-localize-post",
  templateUrl: "./localize-post.component.html",
  imports: [SearchPlace, MapComponent],
  standalone: true
})
export class LocalizePostComponent implements OnInit {

  mapId = 'map-localize-post';
  isLoading = false;
  isVisible = false;
  location: PlaceDto;
  saved_location: PlaceDto | undefined;
  @Output() closed$ = new EventEmitter<PlaceDto | undefined>();
  @Output() resetPlace$ = new EventEmitter<void>();

  private readonly mapService = inject(MapService);
  private mapSubscription!: Subscription;
  private readonly userStore = inject(UserStore);

  localizeMap: L.Map | null = null;
  localizeLayer: L.LayerGroup | null = new L.LayerGroup();
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  @ViewChild(SearchPlace) searchComponent!: SearchPlace;

  open(){
    console.log('Map opened');
    this.isVisible = true;
  }

  ngOnInit(): void {
    //Wait map initialization before using map from service
    this.mapSubscription = this.mapService.getMap(this.mapId).subscribe(map => {
      if (map) {
        this.localizeMap = map;
        if (this.userStore.user().city != null) {
            const city = this.userStore.user().city;
            if (!city || !city.surface) {
              return;
            }
            this.localizeLayer?.clearLayers();
            const cityLayer = L.geoJSON(city.surface, {
                  style: {
                      color: '#50A3C5',
                      weight: 3,
                      opacity: 0.5
                  }
            });
            this.localizeMap!.flyToBounds(cityLayer.getBounds(),{
              duration: 1,
            });
            cityLayer.addTo(this.localizeLayer!);
            this.localizeLayer.addTo(this.localizeMap!);
        }
      }
    });
  }

  chooseLocation(event: PlaceDto) {
    console.log('Destination choisie : ' + event.marker);
    this.location = event;
  }

  savePostLocation(){
    // Logic to save user post goes here
    console.log('Location saved:', this.location);
    this.saved_location = this.location;
    this.closed$.emit(this.saved_location);
  }

  cancel(){
    this.closed$.emit(undefined);
  }

  resetPlace(){
    this.searchComponent.clear();
    this.saved_location = undefined;
    this.resetPlace$.emit();
  }

}