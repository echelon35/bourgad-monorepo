import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore, UserStore } from '@bourgad-monorepo/core';
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

  public readonly userStore = inject(UserStore);
  public readonly authStore = inject(AuthStore);

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }
}
