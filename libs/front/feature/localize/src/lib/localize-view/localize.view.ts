import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent, SearchPlace } from '@bourgad-monorepo/ui';
import { Store } from '@ngrx/store';
import { selectUser } from '@bourgad-monorepo/core';
import { map } from 'rxjs';

@Component({
  imports: [CommonModule, MapComponent, SearchPlace],
  templateUrl: './localize.view.html',
  standalone: true
})
export class LocalizeView {
  private readonly store = inject(Store);
  userCity$ = this.store.select(selectUser).pipe(map(user => user?.city));
  localizeMap?: L.Map;

  constructor(){
    console.log(this.userCity$);
  }

  receiveMap(map: L.Map) {
    this.localizeMap = map;
  }
}
