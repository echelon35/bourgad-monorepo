import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthenticationApiService } from "./authentication.api.service";
import { CoreConfigService } from "./core.config.service";
import { City, User } from "@bourgad-monorepo/model";
import { map, Observable } from "rxjs";

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

    updateProfile(data: { firstname?: string; lastname?: string; phone?: string }): Observable<void> {
      return this.http.patch<void>(this.API_URL + '/user/profile', data, this.httpOptions);
    }

    updateAvatar(mediaId: number): Observable<{ url: string }> {
      return this.http.post<{ url: string }>(this.API_URL + '/user/avatar', { mediaId }, this.httpOptions);
    }

    uploadAvatar(file: File): Observable<{ url: string; mediaId: number }> {
      const formData = new FormData();
      formData.append('medias', file);
      return this.http.post<Array<{ url: string; mediaId: number }>>(
        this.API_URL + '/media/upload',
        formData,
        { headers: { 'Authorization': `Bearer ${this.authService.getToken()}` } }
      ).pipe(map(medias => medias[0]));
    }

    changeTown(cityId: string): Observable<City> {
      console.log(cityId);
      return this.http.post<City>(this.API_URL + '/user/change-town', { cityId: cityId }, this.httpOptions);
    }
}