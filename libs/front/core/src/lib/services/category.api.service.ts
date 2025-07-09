import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Category, Subcategory } from "@bourgad-monorepo/model";
import { Observable } from "rxjs";
import { CoreConfigService } from "./core.config.service";

@Injectable({
    providedIn: 'root',
})
export class CategoryApiService {
    private httpOptions = {};
    http: HttpClient = inject(HttpClient);
    coreconfig: CoreConfigService = inject(CoreConfigService);

    API_URL = `${this.coreconfig.apiUrl}`;

    constructor(){
        this.httpOptions = {
            headers: new HttpHeaders({ 
              'Content-Type': 'application/json',
            })
          };
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(this.API_URL + `/category`, this.httpOptions);
    }

    getSubCategoriesByCategory(categoryId: number): Observable<Subcategory[]> {
        return this.http.get<Subcategory[]>(this.API_URL + `/category/subcategories?categoryId=${categoryId}`, this.httpOptions);
    }
}