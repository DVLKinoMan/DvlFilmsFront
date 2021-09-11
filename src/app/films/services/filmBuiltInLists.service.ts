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

    deleteFromWatched(filmId: number): Observable<object> {
        var url = this.baseUrl + "/WatchedFilms/Delete/" + filmId;
        return this.http.post(url, {
            watchedTime: null
        });
    }

    addToWantToSee(filmId: number): Observable<object> {
        var url = this.baseUrl + "/WantToSeeFilms/Add/" + filmId;
        return this.http.post(url, null);
    }

    deleteFromWantToSee(filmId: number): Observable<object> {
        var url = this.baseUrl + "/WantToSeeFilms/Delete/" + filmId;
        return this.http.post(url, null);
    }

    addToFavorite(filmId: number): Observable<object> {
        var url = this.baseUrl + "/Favorites/Add/" + filmId + "/Film";
        return this.http.post(url, null);
    }

    deleteFromFavorite(filmId: number): Observable<object> {
        var url = this.baseUrl + "/Favorites/Delete/" + filmId + "/Film";
        return this.http.post(url, null);
    }
}