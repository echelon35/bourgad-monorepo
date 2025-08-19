import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { City } from "@bourgad-monorepo/model";
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

    searchCityByName(name: string): Promise<City[]> {
        return firstValueFrom(this.http.get<City[]>(this.API_URL + `/geo/cities?name=${name}`, this.httpOptions));
    }

}