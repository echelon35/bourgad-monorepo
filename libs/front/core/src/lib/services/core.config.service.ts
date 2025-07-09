// libs/front/core/src/lib/config/core-config.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CoreConfigService {
  apiUrl = ''; // Valeur par défaut, remplacée à l'init
  appName = '';
  frontPage = '';
}
