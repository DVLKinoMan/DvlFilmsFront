import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { FilmGenre } from "src/app/films/filmGenre";

@Injectable({
    providedIn: "root",
})

export class GenresService {
    baseUrl = "https://localhost:44338";

    constructor(private http: HttpClient) {

    }

    getAllGenres(): Observable<FilmGenre[]> {
        var url = this.baseUrl + "/Films/Get/Genres";

        return this.http.get<FilmGenre[]>(url);
    }
}