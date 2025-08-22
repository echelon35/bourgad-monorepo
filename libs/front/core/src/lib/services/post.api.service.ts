import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { Media, Post } from "@bourgad-monorepo/model";
import { CoreConfigService } from "./core.config.service";
import { AuthenticationApiService } from "./authentication.api.service";
import { CreateLocationDto, FeedPostDto } from "@bourgad-monorepo/internal";
import { Location } from "@bourgad-monorepo/model";


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
        console.log('postPost called with:', post);
        return this.http.post<void>(this.API_URL + `/post`, post, this.httpOptions);
    }

    postLocation(location: CreateLocationDto): Promise<Location> {
        console.log('postLocation called with:', location);
        return firstValueFrom(this.http.post<Location>(this.API_URL + `/location`, location, this.httpOptions));
    }

    postMedia(medias: File[]): Promise<Media[]> {
        const formData = new FormData();
        medias.forEach(media => {
            formData.append('medias', media);
        });

        return firstValueFrom(this.http.post<Media[]>(this.API_URL + `/media/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${this.auth_service.getToken()}`
            }
        }));
    }

    getFeed(): Observable<FeedPostDto[]> {
        return this.http.get<FeedPostDto[]>(this.API_URL + `/post?onlyWithLocation=true`, this.httpOptions);
    }

}