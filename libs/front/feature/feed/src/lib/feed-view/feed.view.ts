import { AfterViewInit, Component, effect, inject, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FeedModal } from "../feed-modal/feed.modal";
import { MakePost, MapComponent, MapService, SearchPlace, SenseOfResults, ToastrService } from '@bourgad-monorepo/ui';
import { AuthenticationApiService, GeoApiService, UserStore } from '@bourgad-monorepo/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthStore } from '@bourgad-monorepo/core';

@Component({
  selector: 'bgd-feed',
  templateUrl: './feed.view.html',
  imports: [MapComponent, MakePost, CommonModule, FeedModal, SearchPlace],
  providers: [GeoApiService],
  standalone: true
})
export class FeedView implements AfterViewInit {
    @ViewChild('feedMap') feedMapComponent?: MapComponent;
    readonly geoApiService = inject(GeoApiService);
    readonly authenticationApiService = inject(AuthenticationApiService);
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
    private mapSubscription!: Subscription;

    constructor() {

      const mail = this.route.snapshot.queryParamMap.get('mail');
      if(mail){
        this.toastrService.success(`Inscription réalisée avec succès.`,`Un mail de confirmation vient de vous être envoyé à <b>${mail}</b>.`);
      }

      effect(() => {
        if(this.userStore.userCityLoaded()) {
          if(this.userStore.user().cityId == null){
            this.router.navigate(['/localize']);
          }
          else{
            this.mapSubscription = this.mapService.getMap(this.mapId).subscribe(map => {
              if (map) {
                this.feedMap = map;
                if (this.userStore.user().city != null) {
                    this.feedLayer?.clearLayers();
                    const cityLayer = L.geoJSON(this.userStore.user().city.surface, {
                          style: {
                              color: '#50A3C5',
                              weight: 3,
                              opacity: 0.5
                          }
                    });
                    this.feedMap!.flyToBounds(cityLayer.getBounds());
                    cityLayer.addTo(this.feedLayer!);
                    this.feedLayer.addTo(this.feedMap!);
                  // });
                }
              }
            });
          }
        }
      });

    }

    ngAfterViewInit(): void {
            console.log(this.userStore.user());

    }

    openFeed() {
      document.querySelector('#feed-modal')?.classList.toggle('hidden');
    }

}
