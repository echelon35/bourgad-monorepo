import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, MapService, SearchPlace, ToastrService } from '@bourgad-monorepo/ui';
import { Store } from '@ngrx/store';
import { selectUser, UserApiService } from '@bourgad-monorepo/core';
import { map, Observable, Subscription } from 'rxjs';
import { City } from '@bourgad-monorepo/model';
import { PlaceDto } from '@bourgad-monorepo/external';
import * as L from 'leaflet';

@Component({
  imports: [CommonModule, MapComponent, SearchPlace],
  templateUrl: './localize.view.html',
  standalone: true
})
export class LocalizeView implements OnInit {
  private readonly store = inject(Store);
  private readonly toastrService = inject(ToastrService);
  private readonly userApiService = inject(UserApiService);

  localizeMap?: L.Map;
  localizeLayer?: L.LayerGroup = new L.LayerGroup();
  userCity$: Observable<City | undefined>;
  place: PlaceDto | undefined;
  success = false;
  mapId = 'map-localize';

  private readonly mapService = inject(MapService);
  private mapSubscription!: Subscription;

  constructor(){
    this.userCity$ = this.store.select(selectUser).pipe(map(user => user?.city));
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
            this.localizeLayer?.addTo(this.localizeMap!);
          });
        }
      }
    });
  }

  updateLocation(place: PlaceDto){
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
      console.log(this.place);
      this.userApiService.changeTown(this.place.id).subscribe({
        next: () => {
          this.toastrService.success('Bourgade sauvegardée avec succès.');
          this.success = true;
        },
        error: () => this.toastrService.error('Erreur lors de la sauvegarde de la bourgade.')
      });
    }
    else{
      this.toastrService.error('Veuillez sélectionner un lieu afin de sauvegarder votre bourgade.');
    }
  }
}
