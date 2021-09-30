import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from "rxjs";
import { Film } from "../film";
import { MovieIncludingProperty } from "../enums";

@Injectable({
    providedIn: 'root',
})

export class FilmFetcherService {
    //todo find a better way to have an address
    baseUrl = "https://localhost:44362";

    constructor(
        private http: HttpClient
    ) {

    }

    getByUrl(imdbPageUrl: string, includingProps: MovieIncludingProperty): Observable<Film> {
        var url = this.baseUrl + "/Movies/Get";
        let params = new HttpParams();
        params = params.append("url", imdbPageUrl);
        params = params.append("includingProps", includingProps);
        return this.http.get<Film>(url, { params: params });
    }
}