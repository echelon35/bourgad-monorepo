import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, Observable } from "rxjs";
import { Media } from "@bourgad-monorepo/model";
import { CoreConfigService } from "./core.config.service";
import { AuthenticationApiService } from "./authentication.api.service";

@Injectable({
    providedIn: 'root',
})
export class MediaApiService {
    private httpOptions = {};
    http: HttpClient = inject(HttpClient);
    core_config = inject(CoreConfigService);
    auth_service = inject(AuthenticationApiService);

    API_URL = this.core_config.apiUrl;

    constructor() {
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.auth_service.getToken()}`
            })
        };
    }

    getImportedMedias(): Observable<Media[]> {
        return this.http.get<Media[]>(this.API_URL + `/media/imported`, this.httpOptions);
    }

    uploadMedias(files: File[]): Promise<Media[]> {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('medias', file);
        });

        return firstValueFrom(this.http.post<Media[]>(this.API_URL + `/media/upload`, formData, {
            headers: {
                'Authorization': `Bearer ${this.auth_service.getToken()}`
            }
        }));
    }
}
