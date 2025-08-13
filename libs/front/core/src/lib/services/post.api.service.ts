import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { City, Post } from "@bourgad-monorepo/model";
import { CoreConfigService } from "./core.config.service";
import { AuthenticationApiService } from "./authentication.api.service";


@Injectable({
    providedIn: 'root',
})
export class PostApiService {
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

    postPost(post: Post): Observable<void> {
        return this.http.post<void>(this.API_URL + `/post`, post, this.httpOptions);
    }

}