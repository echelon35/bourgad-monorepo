import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthenticationApiService, selectIsAuthenticated, UserApiService, UserStore } from '@bourgad-monorepo/core';
import { GeoApiService } from '@bourgad-monorepo/core';
import { ToastrComponent } from '@bourgad-monorepo/ui';
import { Store } from '@ngrx/store';

@Component({
    selector: 'bgd-root',
    templateUrl: './app.html',
    imports: [RouterOutlet, ToastrComponent],
    standalone: true
})
export class App {
  title = 'bourgad';
  isSidebarOpen = false;
  readonly userStore = inject(UserStore);
  readonly store = inject(Store);
  readonly geoApiService = inject(GeoApiService);
  readonly userService = inject(UserApiService);
  readonly authenticationService = inject(AuthenticationApiService);

  constructor() {
    this.userStore.resetUser();
    // If user is authenticated, get profile
    if(this.store.select(selectIsAuthenticated)) {
      this.userService.getProfile().subscribe((user) => {
        console.log(user);
        this.authenticationService.storeUser(user);
        console.log(this.userStore);
      })
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
