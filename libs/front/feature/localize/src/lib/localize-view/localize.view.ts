import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, MapService, SearchPlace, ToastrService, SpinnerComponent } from '@bourgad-monorepo/ui';
import { UserStore } from '@bourgad-monorepo/core';
import { Subscription } from 'rxjs';
import { PlaceDto } from '@bourgad-monorepo/external';
import * as L from 'leaflet';

@Component({
  imports: [CommonModule, MapComponent, SearchPlace, SpinnerComponent],
  templateUrl: './localize.view.html',
  standalone: true
})
export class LocalizeView {
  private readonly toastrService = inject(ToastrService);

  localizeMap?: L.Map;
  localizeLayer?: L.LayerGroup = new L.LayerGroup();
  place: PlaceDto | undefined;
  success = false;
  mapId = 'map-localize';

  private readonly mapService = inject(MapService);
  private mapSubscription!: Subscription;
  public readonly userStore = inject(UserStore);
  public readonly authStore = inject(UserStore);

  constructor() {
      effect(() => {
        if(this.userStore.userCityLoaded()) {
          console.log('User city loaded, initializing map...');
            this.mapSubscription = this.mapService.getMap(this.mapId).subscribe(map => {
              console.log(map);
              if (map) {
                this.localizeMap = map;
                if (this.userStore.user().city != null) {
                    this.localizeLayer?.clearLayers();
                    const cityLayer = L.geoJSON(this.userStore.user().city.surface, {
                          style: {
                              color: '#50A3C5',
                              weight: 3,
                              opacity: 0.5
                          }
                    });
                    this.localizeMap!.fitBounds(cityLayer.getBounds(), { maxZoom: 12 });
                    cityLayer.addTo(this.localizeLayer!);
                    this.localizeLayer!.addTo(this.localizeMap!);
                }
              }
            });
        }
      });
  }

  updateLocation(place: PlaceDto){
    console.log('Updating location to:', place);
    this.place = place;
    if(this.localizeMap != null){
      this.localizeLayer?.clearLayers();
      const cityLayer = L.geoJSON(place.surface.toGeoJSON(), {
          style: {
              color: '#50A3C5',
              weight: 3,
              opacity: 0.5
          }
      });
      // this.feedMap!.flyToBounds(cityLayer.getBounds());
      cityLayer.addTo(this.localizeLayer!);
      this.localizeLayer?.addTo(this.localizeMap!);
    }
  }
  
  saveUserLocation(){
    if(this.place){
      console.log('Saving place:', this.place);
      this.userStore.updateCity(this.place.id);
      this.toastrService.success('Votre bourgade a bien été sauvegardée.');
    }
    else{
      this.toastrService.error('Veuillez sélectionner un lieu afin de sauvegarder votre bourgade.');
    }
  }
}
