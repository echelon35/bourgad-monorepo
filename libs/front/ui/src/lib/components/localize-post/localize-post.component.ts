import { Component, EventEmitter, inject, OnInit, Output, ViewChild } from "@angular/core";
import { City } from "@bourgad-monorepo/model";
import L from "leaflet";
import { map, Observable, Subscription } from "rxjs";
import { SearchPlace } from "../search-place/search-place.modal";
import { MapComponent } from "../map/map.component";
import { Point } from "geojson";
import { SpinnerComponent } from "../spinner/spinner.component";
import { Store } from "@ngrx/store";
import { selectUser } from "@bourgad-monorepo/core";
import { MapService } from "../../services/map.service";
import { PlaceDto } from "@bourgad-monorepo/external";

@Component({
  selector: "bgd-localize-post",
  templateUrl: "./localize-post.component.html",
  imports: [SearchPlace, MapComponent, SpinnerComponent],
  standalone: true
})
export class LocalizePostComponent implements OnInit {

  mapId = 'map-localize-post';
  isLoading = false;
  isVisible = false;
  userCity$: Observable<City | undefined>;
  location: PlaceDto;
  @Output() closed = new EventEmitter<PlaceDto | undefined>();

  private readonly mapService = inject(MapService);
  private mapSubscription!: Subscription;
  private readonly store = inject(Store);

  localizeMap: L.Map | null = null;
  localizeLayer: L.LayerGroup | null = new L.LayerGroup();
  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(){
    this.userCity$ = this.store.select(selectUser).pipe(map(user => user?.city));
  }

  open(){
    console.log('Map opened');
    this.isVisible = true;
  }

  ngOnInit(): void {
    //Wait map initialization before using map from service
    this.mapSubscription = this.mapService.getMap(this.mapId).subscribe(map => {
      if (map) {
        this.localizeMap = map;
        if (this.userCity$ != null) {
          this.userCity$.subscribe(city => {
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
            this.localizeMap!.flyToBounds(cityLayer.getBounds());
            cityLayer.addTo(this.localizeLayer!);
            this.localizeLayer.addTo(this.localizeMap!);
          });
        }
      }
    });
  }

  chooseLocation(event: PlaceDto) {
    console.log('Destination choisie : ' + event.marker);
    this.location = event;
  }

  saveUserPost(){
    // Logic to save user post goes here
    console.log('Location saved:', this.location);
    this.closed.emit(this.location);
  }

  cancel(){
    this.closed.emit(undefined);
  }

}