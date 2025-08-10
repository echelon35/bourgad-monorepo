import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthenticationApiService } from "./authentication.api.service";
import { CoreConfigService } from "./core.config.service";
import { User } from "@bourgad-monorepo/model";

@Injectable({
    providedIn: 'root'
})
export class UserApiService {
    private httpOptions = {};
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthenticationApiService);
    private readonly coreConfigService = inject(CoreConfigService);
    API_URL = this.coreConfigService.apiUrl;

    constructor(){
        this.httpOptions = {
            headers: new HttpHeaders({ 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${this.authService.getToken()}`
            })
          };
    }

    getSummaryInfos(){
      return this.http.get<User>(this.API_URL + '/user/summary', this.httpOptions);
    }

    getProfile(){
      return this.http.get<User>(this.API_URL + '/user/profile', this.httpOptions);
    }
    
    changeTown(cityId: string){
      return this.http.post<User>(this.API_URL + '/user/change-town', { cityId: cityId }, this.httpOptions);
    }
}