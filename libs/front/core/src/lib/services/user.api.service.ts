import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class UserApiService {
    private httpOptions = {};
    // private readonly http = inject(HttpClient);

    constructor(){
        // this.httpOptions = {
        //     headers: new HttpHeaders({ 
        //       'Content-Type': 'application/json',
        //     })
        //   };
    }
}