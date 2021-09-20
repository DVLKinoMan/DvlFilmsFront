import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ListItem } from "src/app/lists/list.model";


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

    listFavorites(curPage: number, itemsPerPage: number): Observable<ListItem[]> {
        var url = this.baseUrl + "/Favorites/List/Persons";
        return this.http.get<ListItem[]>(url, {
            params: {
                curPage: curPage,
                itemsPerPage: itemsPerPage
            }
        });
    }

    listFavoritesCount(): Observable<number> {
        var url = this.baseUrl + "/Favorites/List/Persons/Count";
        return this.http.get<number>(url);
    }

    updateFavorites(items: ListItem[]): Observable<object> {
        var url = this.baseUrl + "/Favorites/Update/Person";
        return this.http.post(url, { items: items });
    }
}