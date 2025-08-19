// map.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class MapService {
  // Stocke les cartes par ID, avec leur état de visibilité
  private maps = new Map<string, { subject: BehaviorSubject<L.Map | null>; isVisible: boolean }>();

  // Retourne l'Observable pour une carte donnée
  getMap(mapId: string): Observable<L.Map | null> {
    if (!this.maps.has(mapId)) {
      this.maps.set(mapId, { subject: new BehaviorSubject<L.Map | null>(null), isVisible: false });
    }
    return this.maps.get(mapId)!.subject.asObservable();
  }

  // Définit une carte pour un ID donné
  setMap(mapId: string, map: L.Map | null, isVisible = true): void {
    if (!this.maps.has(mapId)) {
      this.maps.set(mapId, { subject: new BehaviorSubject<L.Map | null>(null), isVisible: false });
    }
    this.maps.get(mapId)!.subject.next(map);
    this.maps.get(mapId)!.isVisible = isVisible;
  }

  // Met à jour la visibilité d'une carte
  setMapVisibility(mapId: string, isVisible: boolean): void {
    if (this.maps.has(mapId)) {
      this.maps.get(mapId)!.isVisible = isVisible;
      if (isVisible) {
        // Si la carte devient visible, on force un redimensionnement
        const map = this.maps.get(mapId)!.subject.getValue();
        if (map) {
          setTimeout(() => map.invalidateSize(), 0);
        }
      }
    }
  }
}
