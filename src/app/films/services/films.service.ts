import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Film, QueryListResult } from "../film";
import { FilmCastMember } from "../film-edit/film-cast-crew/filmCastMember";
import { FilmCrewMember } from "../film-edit/film-cast-crew/filmCrewMember";
import { FilmAwardResult } from "../film-edit/film-awards/FilmAwardResult";
import { FilmAnotherName } from "../film-edit/film-another-names/filmAnotherName";
import { FilmsQuery } from "../films-list/film-query";
import { FilmItem } from "src/app/persons/person";

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

    getList(query: FilmsQuery): Observable<QueryListResult> {
        var url = this.baseUrl + "/Films/List";

        let params = new HttpParams();
        query.filmFilters.forEach(function (value) {
            params = params.append('filmFilters', JSON.stringify(value, (key, val) => {
                if (val === null || (typeof val === 'string' && val === ''))
                    return undefined;
                return val;
            }));
        });
        // var str = typeof query.personFilters == "string" ? query.personFilters : JSON.stringify(query.personFilters);

        // params = params.append("personFilters", str);
        params = params.append("selectControlFlags", query.selectControlFlags);
        params = params.append("currentPage", query.currentPage);
        params = params.append("pageSize", query.pageSize);
        params = params.append("orderBy", query.orderBy);
        params = params.append("orderByAscending", query.orderByAscending);

        return this.http.get<QueryListResult>(url, {
            params: params,
        });
    }

    update(film: Film): Observable<Film> {
        var url = this.baseUrl + "/Films/Update";

        return this.http.post<Film>(url, film);
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

    getAnotherNames(filmId: number): Observable<FilmAnotherName[]> {
        var url = this.baseUrl + "/Films/Get/" + filmId + "/AnotherNames";

        return this.http.get<FilmAnotherName[]>(url);
    }

    getFilmItems(name: string, take: number, exactMatch: boolean): Observable<FilmItem[]> {
        var url = this.baseUrl + "/Films/Search/FilmItem";

        var params = new HttpParams();
        params = params.append("name", name);
        params = params.append("take", take);
        params = params.append("exactMatch", exactMatch);

        return this.http.get<FilmItem[]>(url, {
            params: params
        })
    }

    getTvDescriptions(): Observable<string[]> {
        var url = this.baseUrl + "/Films/Get/TvDescriptions";

        return this.http.get<string[]>(url);
    }
}