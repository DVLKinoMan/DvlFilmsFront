import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Country } from "../country";

@Injectable({
    providedIn: "root",
})

export class CountriesService {
    baseUrl = "https://localhost:44338";

    constructor(private http: HttpClient) {

    }

    getAllCountries(): Observable<Country[]> {
        var url = this.baseUrl + "/Films/Get/Countries";

        return this.http.get<Country[]>(url);
    }
}