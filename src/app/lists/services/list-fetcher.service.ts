import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { List } from "../list.model";

@Injectable({
    providedIn: 'root',
})

export class ListFetcherService {
    //todo find a better way to have an address
    baseUrl = "https://localhost:44362";

    constructor(
        private http: HttpClient
    ) {

    }

    getByUrl(imdbPageUrl: string): Observable<List> {
        var url = this.baseUrl + "/Lists/Get";
        let params = new HttpParams();
        params = params.append("url", imdbPageUrl)
        return this.http.get<List>(url, { params: params });
    }
}