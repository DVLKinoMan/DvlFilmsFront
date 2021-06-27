import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Company } from "../company";

@Injectable({
    providedIn: "root",
})

export class CompaniesService {
    baseUrl = "https://localhost:44338";

    constructor(private http: HttpClient) {

    }

    getAllCompanies(): Observable<Company[]> {
        var url = this.baseUrl + "/Films/Get/Companies";

        return this.http.get<Company[]>(url);
    }
}