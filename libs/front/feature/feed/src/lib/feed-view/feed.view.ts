import { Component, effect, inject, ViewChild } from '@angular/core';
import { MakePostModal } from '../makepost-modal/makepost.modal';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FeedModal } from "../feed-modal/feed.modal";
import { MapComponent, SearchPlace, SenseOfResults } from '@bourgad-monorepo/ui';
import { GeoApiService, UserStore } from '@bourgad-monorepo/core';
import { City } from '@bourgad-monorepo/model';

@Component({
  selector: 'bgd-feed',
  templateUrl: './feed.view.html',
  imports: [MapComponent, MakePostModal, CommonModule, FeedModal, SearchPlace],
  providers: [GeoApiService],
  standalone: true
})
export class FeedView {
    @ViewChild('makePostModal') makePostModal?: MakePostModal;
    geoApiService = inject(GeoApiService);
    readonly userStore = inject(UserStore);

    feedMap?: L.Map;
    public senseOfResults: SenseOfResults = SenseOfResults.TOP;

    constructor() {
      // Initialize the user store or any other services if needed
      effect(() => {
        const city = this.userStore.city ? this.userStore.city() : undefined;
        console.log("City in feed view: ", city);
        if (city) {
          this.updateMap(city);
        }
      });
    }

    /**
     * Receive map from the map component
     * @param map 
     */
    receiveMap(map: L.Map) {
      this.feedMap = map;
      if (this.userStore && typeof this.userStore.city === 'function') {
        const city = this.userStore.city();
        if (city != null) {
          this.updateMap(city);
        }
      }
    }

    updateMap(city: City) {
      if(this.feedMap) {
      const city = this.userStore.city ? this.userStore.city() : undefined;
      console.log("City received in feed view: ", city);
      if (!city || !city.surface) {
        return;
      }
      const cityLayer = L.geoJSON(city.surface, {
            style: {
                color: '#50A3C5',
                weight: 3,
                opacity: 0.5
            }
        });
        this.feedMap!.flyToBounds(cityLayer.getBounds());
        cityLayer.addTo(this.feedMap!);
      }
    }

    openFeed() {
      document.querySelector('#feed-modal')?.classList.toggle('hidden');
    }

}
