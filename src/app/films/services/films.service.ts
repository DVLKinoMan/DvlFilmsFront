import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Film } from "../film";
import { FilmAwardResult } from "../film-edit/film-awards/FilmAwardResult";
import { FilmCastMember } from "../film-edit/film-cast-crew/filmCastMember";
import { FilmCrewMember } from "../film-edit/film-cast-crew/filmCrewMember";

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

    getCrew(filmId: number): Observable<FilmCrewMember[]> {
        var url = this.baseUrl + "/Films/Get/" + filmId + "/Crew";

        return this.http.get<FilmCrewMember[]>(url);
    }

    getAwards(filmId: number): Observable<FilmAwardResult[]> {
        var url = this.baseUrl + "/Films/Get/" + filmId + "/Awards";

        return this.http.get<FilmAwardResult[]>(url);
    }
}