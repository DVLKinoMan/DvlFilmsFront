import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Film } from "../film";

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
}