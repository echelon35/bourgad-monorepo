import { AfterViewInit, Component, effect, inject } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FeedModal } from "../feed-modal/feed.modal";
import { MakePost, MapComponent, MapService, SearchPlace, SenseOfResults, ToastrService } from '@bourgad-monorepo/ui';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore, UserStore } from '@bourgad-monorepo/core';

@Component({
  templateUrl: './feed.view.html',
  imports: [MapComponent, MakePost, CommonModule, FeedModal, SearchPlace],
  standalone: true
})
export class FeedView {
    readonly route = inject(ActivatedRoute);
    public readonly userStore = inject(UserStore);
    public readonly authStore = inject(AuthStore);
    public readonly router = inject(Router);
    private readonly toastrService = inject(ToastrService);

    avatarUrl: string = this.userStore.user().avatar ? this.userStore.user().avatar.url : '/assets/village.svg';
    mapId = 'map-feed';

    feedMap?: L.Map;
    feedLayer?: L.LayerGroup = new L.LayerGroup();
    public senseOfResults: SenseOfResults = SenseOfResults.TOP;

    private readonly mapService = inject(MapService);

    constructor() {

      const mail = this.route.snapshot.queryParamMap.get('mail');
      if(mail){
        this.toastrService.success(`Inscription réalisée avec succès.`,`Un mail de confirmation vient de vous être envoyé à <b>${mail}</b>.`);
      }

      effect(() => {
        if(this.userStore.userCityLoaded()) {
          console.log('User city loaded, initializing map...');
          if(this.userStore.user().cityId == null){
            this.router.navigate(['/localize']);
          }
          else{
            this.mapService.getMap(this.mapId).subscribe(map => {
              if (map !== null) {
                this.feedMap = map;
                if (this.userStore.user().city != null && this.feedLayer != null) {
                    this.feedLayer.clearLayers();
                    const cityLayer = L.geoJSON(this.userStore.user().city.surface, {
                          style: {
                              color: '#50A3C5',
                              weight: 3,
                              opacity: 0.5
                          }
                    });
                    console.log(`fitBounds called for map: ${this.mapId}:`, map);
                    this.feedMap.fitBounds(cityLayer.getBounds(), { maxZoom: 13 });
                    cityLayer.addTo(this.feedLayer);
                    this.feedLayer.addTo(this.feedMap);
                }
              }
            });
          }
        }
      });

    }

    openFeed() {
      document.querySelector('#feed-modal')?.classList.toggle('hidden');
    }

}
