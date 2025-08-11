import { Component, effect, inject, ViewChild } from '@angular/core';
import { MakePostModal } from '../makepost-modal/makepost.modal';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FeedModal } from "../feed-modal/feed.modal";
import { MapComponent, SearchPlace, SenseOfResults, ToastrService } from '@bourgad-monorepo/ui';
import { AuthenticationApiService, GeoApiService, selectIsAuthenticated, selectUser, UserApiService, UserStore } from '@bourgad-monorepo/core';
import { City } from '@bourgad-monorepo/model';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'bgd-feed',
  templateUrl: './feed.view.html',
  imports: [MapComponent, MakePostModal, CommonModule, FeedModal, SearchPlace],
  providers: [GeoApiService],
  standalone: true
})
export class FeedView {
    @ViewChild('makePostModal') makePostModal?: MakePostModal;
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

    feedMap?: L.Map;
    feedLayer?: L.LayerGroup = new L.LayerGroup();
    public senseOfResults: SenseOfResults = SenseOfResults.TOP;

    constructor() {

      const token = this.route.snapshot.queryParamMap.get('access_token');
      const mail = this.route.snapshot.queryParamMap.get('mail');
      if(token){
        this.authenticationApiService.saveToken(token);
        this.userApiService.getProfile().subscribe((user) => {
          this.authenticationApiService.storeUser(user);
          if(user.cityId == null){
            this.router.navigate(['/localize']);
          }
        });
      }
      else if(mail){
        this.toastrService.success(`Inscription réalisée avec succès.`,`Un mail de confirmation vient de vous être envoyé à <b>${mail}</b>.`);
      }

      this.avatarUrl$ = this.store.select(selectUser).pipe(
                  map(user => user?.avatar ? user?.avatar?.url : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'))
              
      this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
      this.city$ = this.store.select(selectUser).pipe(
        map(user => user?.city)
      );
    }

    /**
     * Receive map from the map component
     * @param map 
     */
    receiveMap(map: L.Map) {
      this.feedMap = map;
      if (this.city$ != null) {
        this.city$.subscribe(city => {
          if (city) {
            this.updateMap(city);
          }
        });
      }
    }

    updateMap(city: City) {
      if(this.feedMap) {
        console.log("City received in feed view: ", city);
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
      }
    }

    openFeed() {
      document.querySelector('#feed-modal')?.classList.toggle('hidden');
    }

}
