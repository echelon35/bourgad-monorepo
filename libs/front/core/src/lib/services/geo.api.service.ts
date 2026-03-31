import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { City, ManchePlace } from "@bourgad-monorepo/model";
import { CoreConfigService } from "./core.config.service";
import { AuthenticationApiService } from "./authentication.api.service";


@Injectable({
    providedIn: 'root',
})
export class GeoApiService {
    private httpOptions = {};
    http: HttpClient = inject(HttpClient);
    core_config = inject(CoreConfigService);
    auth_service = inject(AuthenticationApiService);

    API_URL = this.core_config.apiUrl;

    constructor(){
        this.httpOptions = {
            headers: new HttpHeaders({ 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.auth_service.getToken()}`
            })
          };
    }

    getCityById(cityId: string): Observable<City> {
        return this.http.get<City>(this.API_URL + `/geo/city/${cityId}`, this.httpOptions);
    }

    searchCityByName(name: string, deptId?: number): Promise<City[]> {
        const params = new URLSearchParams({ name });
        if (deptId !== undefined) params.set('deptId', String(deptId));
        return firstValueFrom(this.http.get<City[]>(this.API_URL + `/geo/cities?${params}`, this.httpOptions));
    }

    searchPlaceByName(name: string): Promise<ManchePlace[]> {
        const params = new URLSearchParams({ q: name, limit: '10' });
        return firstValueFrom(this.http.get<ManchePlace[]>(this.API_URL + `/geo/places/autocomplete?${params}`, this.httpOptions));
    }

}