import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ListItem } from "src/app/lists/list.model";
import { FilmWatch } from "../film-watch.model";


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

    addToFavorites(filmId: number): Observable<object> {
        var url = this.baseUrl + "/Favorites/Add/" + filmId + "/Film";
        return this.http.post(url, null);
    }

    deleteFromFavorites(filmId: number): Observable<object> {
        var url = this.baseUrl + "/Favorites/Delete/" + filmId + "/Film";
        return this.http.post(url, null);
    }

    getWatchHistory(filmId: number): Observable<FilmWatch[]> {
        var url = this.baseUrl + "/WatchedFilms/List/" + filmId;
        return this.http.get<FilmWatch[]>(url);
    }

    updateWatchHistory(watches: FilmWatch[]): Observable<object> {
        var url = this.baseUrl + "/WatchedFilms/Update";
        return this.http.post(url, { watches: watches });
    }

    listFavorites(): Observable<ListItem[]> {
        var url = this.baseUrl + "/Favorites/List/Films";
        return this.http.get<ListItem[]>(url);
    }

    listWantToSeeFilms(): Observable<ListItem[]> {
        var url = this.baseUrl + "/WantToSeeFilms/List/";
        return this.http.get<ListItem[]>(url);
    }

    updateFavorites(items: ListItem[]): Observable<object> {
        var url = this.baseUrl + "/Favorites/Update/Film";
        return this.http.post(url, { items: items });
    }

    updateWantToSeeFilms(items: ListItem[]): Observable<object> {
        var url = this.baseUrl + "/WantToSeeFilms/Update";
        return this.http.post(url, { items: items });
    }
}