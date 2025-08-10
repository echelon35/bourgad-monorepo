import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, SearchPlace, ToastrService } from '@bourgad-monorepo/ui';
import { Store } from '@ngrx/store';
import { selectUser, UserApiService } from '@bourgad-monorepo/core';
import { map, Observable } from 'rxjs';
import { City } from '@bourgad-monorepo/model';
import { PlaceDto } from '@bourgad-monorepo/external';
import * as L from 'leaflet';

@Component({
  imports: [CommonModule, MapComponent, SearchPlace],
  templateUrl: './localize.view.html',
  standalone: true
})
export class LocalizeView {
  private readonly store = inject(Store);
  private readonly toastrService = inject(ToastrService);
  private readonly userApiService = inject(UserApiService);

  localizeMap?: L.Map;
  localizeLayer?: L.LayerGroup = new L.LayerGroup();
  userCity$: Observable<City | undefined>;
  place: PlaceDto | undefined;
  success = false;

  constructor(){
    this.userCity$ = this.store.select(selectUser).pipe(map(user => user?.city));
  }

  receiveMap(map: L.Map) {
    map.setView([46.603354, 1.888334], 3);
    this.localizeMap = map;
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
