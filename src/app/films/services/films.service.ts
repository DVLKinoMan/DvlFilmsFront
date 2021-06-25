import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Film, FilmCastMember } from "../film";
import { FilmAwardResult } from "../film-edit/film-awards/FilmAwardResult";

@Injectable({
    providedIn: 'root',
})

export class FilmsService {
    baseUrl = "https://localhost:44338";

    constructor(private http: HttpClient) {

    }

    getById(id: number): Observable<Film> {
        var url = this.baseUrl + "/Films/Get/" + id;

        return this.http.get<Film>(url);
    }

    getCast(filmId: number): Observable<FilmCastMember[]> {
        var url = this.baseUrl + "/Films/Get/" + filmId + "/Cast";

        return this.http.get<FilmCastMember[]>(url);
    }


    getAwards(filmId: number): Observable<FilmAwardResult[]> {
        var url = this.baseUrl + "/Films/Get/" + filmId + "/Awards";

        return this.http.get<FilmAwardResult[]>(url);
    }
}