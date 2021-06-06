import { Inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Filmography, Person } from "../person";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root',
  })
  
export class PersonFetcherService {
    //todo find a better way to have an address
    baseUrl = "https://localhost:44362";

    constructor(
        private http: HttpClient
    ){
        
    }

    getByUrl(imdbPageUrl: string) : Observable<Person>{
        var url = this.baseUrl + "/Persons/Get";
        let params = new HttpParams();
        params = params.append("url", imdbPageUrl)
        return this.http.get<Person>(url, {params: params} );
    }
}