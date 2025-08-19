import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { MakePostModal } from '../makepost-modal/makepost.modal';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FeedModal } from "../feed-modal/feed.modal";
import { MapComponent, MapService, SearchPlace, SenseOfResults, ToastrService } from '@bourgad-monorepo/ui';
import { AuthenticationApiService, GeoApiService, selectIsAuthenticated, selectUser, UserApiService, UserStore } from '@bourgad-monorepo/core';
import { City } from '@bourgad-monorepo/model';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'bgd-feed',
  templateUrl: './feed.view.html',
  imports: [MapComponent, MakePostModal, CommonModule, FeedModal, SearchPlace],
  providers: [GeoApiService],
  standalone: true
})
export class FeedView implements AfterViewInit {
    @ViewChild('makePostModal') makePostModal?: MakePostModal;
    @ViewChild('feedMap') feedMapComponent?: MapComponent;
    readonly geoApiService = inject(GeoApiService);
    readonly authenticationApiService = inject(AuthenticationApiService);
    readonly route = inject(ActivatedRoute);
    private readonly store = inject(Store);
    public readonly router = inject(Router);
    private readonly userApiService = inject(UserApiService);
    private readonly toastrService = inject(ToastrService);
    isAuthenticated$: Observable<boolean>;
    avatarUrl$: Observable<string>;
    city$: Observable<City | undefined>;
    mapId = 'map-feed';

    feedMap?: L.Map;
    feedLayer?: L.LayerGroup = new L.LayerGroup();
    public senseOfResults: SenseOfResults = SenseOfResults.TOP;

    private readonly mapService = inject(MapService);
    private mapSubscription!: Subscription;

    constructor() {

      const token = this.route.snapshot.queryParamMap.get('access_token');
      const mail = this.route.snapshot.queryParamMap.get('mail');
      if(token){
        this.authenticationApiService.saveToken(token);
        this.router.navigate(['/'])
        .then(() => {
          window.location.reload();
        });
      }
      else if(mail){
        this.toastrService.success(`Inscription réalisée avec succès.`,`Un mail de confirmation vient de vous être envoyé à <b>${mail}</b>.`);
      }

      this.userApiService.getProfile().subscribe((user) => {
        this.authenticationApiService.storeUser(user);
        if(user.cityId == null){
          this.router.navigate(['/localize']);
        }
      });

      this.avatarUrl$ = this.store.select(selectUser).pipe(
                  map(user => user?.avatar ? user?.avatar?.url : '/assets/village.svg'))

      this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
      this.city$ = this.store.select(selectUser).pipe(
        map(user => user?.city)
      );
    }

    ngAfterViewInit(): void {
      this.mapSubscription = this.mapService.getMap(this.mapId).subscribe(map => {
        if (map) {
          this.feedMap = map;
          if (this.city$ != null) {
            this.city$.subscribe(city => {
              if (!city || !city.surface) {
                return;
              }
              this.feedLayer?.clearLayers();
              const cityLayer = L.geoJSON(city.surface, {
                    style: {
                        color: '#50A3C5',
                        weight: 3,
                        opacity: 0.5
                    }
              });
              this.feedMap!.flyToBounds(cityLayer.getBounds());
              cityLayer.addTo(this.feedLayer!);
              this.feedLayer.addTo(this.feedMap!);
            });
          }
        }
      });
    }

    openFeed() {
      document.querySelector('#feed-modal')?.classList.toggle('hidden');
    }

}
