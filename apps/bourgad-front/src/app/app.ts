import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthenticationApiService, selectIsAuthenticated, UserApiService, UserStore } from '@bourgad-monorepo/core';
import { GeoApiService } from '@bourgad-monorepo/core';
import { User } from '@bourgad-monorepo/model';
import { ToastrComponent } from '@bourgad-monorepo/ui';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
    selector: 'bgd-root',
    templateUrl: './app.html',
    imports: [RouterOutlet, ToastrComponent],
    standalone: true
})
export class App {
  title = 'bourgad';
  isSidebarOpen = false;
  readonly store = inject(Store);
  readonly geoApiService = inject(GeoApiService);
  readonly userService = inject(UserApiService);
  readonly authenticationService = inject(AuthenticationApiService);

  isAuthenticated$: Observable<boolean>;

  constructor() {
    // If user is authenticated, get profile
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.isAuthenticated$.subscribe(isAuth => {
      if(isAuth){
        console.log("User is authenticated, fetching profile...");
        this.authenticationService.checkExpiration().subscribe({
          next: (val) => {
            if(val){
                this.userService.getProfile().subscribe((user: User) => {
                console.log(user);
                this.authenticationService.storeUser(user);
                this.geoApiService.getCityById(user.cityId).subscribe((city) => {
                  console.log("City from API: ", city);
                  this.authenticationService.storeUser({ ...user, city: city });
                });
              });
            }
          },
          error: (err) => {
            if(err.status === 401){
              this.authenticationService.logOutExpires();
            }
          }
        });
      }
    });
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
