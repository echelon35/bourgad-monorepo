import {
  ApplicationConfig,
  importProvidersFrom,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CoreConfigService, userReducer } from '@bourgad-monorepo/core';
import { routes } from './app.routes';
import { StoreModule } from '@ngrx/store';
import { localStorageSync } from 'ngrx-store-localstorage';

export function localStorageSyncReducer(reducer: any): any {
    return localStorageSync({keys: ['user'], rehydrate: true })(reducer);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    {
      provide: CoreConfigService,
      useFactory: () => {
        const config = new CoreConfigService();
        config.apiUrl = environment.settings.backend;
        return config;
      },
    },
    importProvidersFrom(
        StoreModule.forRoot({
            user: userReducer,
        },{ metaReducers: [localStorageSyncReducer] }),
    )
  ],
};
