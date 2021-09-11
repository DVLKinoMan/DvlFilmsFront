import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class FilmBuiltInListsService {
    baseUrl = "https://localhost:44338";

    constructor(private http: HttpClient) {

    }

    addToWatched(filmId: number): Observable<object> {
        var url = this.baseUrl + "/WatchedFilms/Add/" + filmId;
        return this.http.post(url, {
            watchedTime: null
        });
    }

    addToWantToSee(filmId: number): Observable<object> {
        var url = this.baseUrl + "/WantToSee/Add/" + filmId;
        return this.http.post(url, {

        });
    }

    addToFavorite(filmId: number): Observable<object> {
        var url = this.baseUrl + "/Favorites/Add/" + filmId + "/Film";
        return this.http.post(url, {

        });
    }
}