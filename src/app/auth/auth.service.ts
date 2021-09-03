import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class AuthService {

    constructor(private http: HttpClient) {

    }

    register(email: string, password: string) {

        return this.http.post("ad",
            {
                email: email,
                password: password,
            }
        );
    }
}