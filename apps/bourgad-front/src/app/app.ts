import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UserStore } from '@bourgad-monorepo/core';
import { User } from '@bourgad-monorepo/model';
import { GeoApiService } from '@bourgad-monorepo/core';
import { ToastrComponent } from '@bourgad-monorepo/ui';

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
  readonly geoApiService = inject(GeoApiService);

  constructor() {
    this.userStore.resetUser();
    this.geoApiService.getCityById("50129").subscribe(city => {
      console.log("City received in app component: ", city);
      this.updateUser({ city: city });
      console.log("Updated user in app component: ", this.userStore);
    });
    this.updateUser({
      firstname: 'Kevin',
      lastname: 'Bourgade'
    });
  }

  updateUser(user: Partial<User>) {
    this.userStore.updateUser(user);
  }

  resetUser() {
    this.userStore.resetUser();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
