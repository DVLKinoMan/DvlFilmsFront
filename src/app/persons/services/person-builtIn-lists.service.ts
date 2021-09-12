import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class PersonBuiltInListsService {
    baseUrl = "https://localhost:44338";

    constructor(private http: HttpClient) {

    }

    addToFavorites(personId: number): Observable<object> {
        var url = this.baseUrl + "/Favorites/Add/" + personId + "/Person";
        return this.http.post(url, null);
    }

    deleteFromFavorites(personId: number): Observable<object> {
        var url = this.baseUrl + "/Favorites/Delete/" + personId + "/Person";
        return this.http.post(url, null);
    }
}