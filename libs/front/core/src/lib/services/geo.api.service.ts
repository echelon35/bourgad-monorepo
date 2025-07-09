import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { City } from "@bourgad-monorepo/model";
import { CoreConfigService } from "./core.config.service";


@Injectable({
    providedIn: 'root',
})
export class GeoApiService {
    private httpOptions = {};
    http: HttpClient = inject(HttpClient);
    core_config = inject(CoreConfigService);

    API_URL = this.core_config.apiUrl;

    constructor(){
        this.httpOptions = {
            headers: new HttpHeaders({ 
              'Content-Type': 'application/json',
            })
          };
    }

    getCityById(cityId: string): Observable<City> {
        return this.http.get<City>(this.API_URL + `/geo/city/${cityId}`, this.httpOptions);
    }
}