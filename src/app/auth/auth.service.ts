import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
    baseUrl = "https://localhost:44338";
    user = new Subject<User>();

    constructor(private http: HttpClient) {

    }

    register(userName: string, password: string, email: string, birthDate: Date): Observable<RegisterResponse> {

        return this.http.post<RegisterResponse>(this.baseUrl + "/Accounts/Register",
            {
                userName: userName,
                email: email,
                password: password,
                birthDate: birthDate
            })
            .pipe(
                catchError(this.handleError),
                tap(resData => {

                })
            );;
    }

    login(userName: string, password: string): Observable<LoginResponse> {

        return this.http.post<LoginResponse>(this.baseUrl + "/Accounts/Login", {
            userName: userName,
            password: password
        })
            .pipe(
                catchError(this.handleError),
                tap(resData => {
                    this.handleAuthentication(
                        resData.userName,
                        resData.photo,
                        resData.token,
                        resData.expiration
                    );
                })
            );
    }

    private handleAuthentication(
        userName: string,
        photo: string,
        token: string,
        expiration: Date
    ) {
        const user = new User(userName, photo, token, expiration);
        this.user.next(user);
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';
        if (!errorRes.error || !errorRes.error.error) {
            return throwError(errorMessage);
        }
        switch (errorRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'This email exists already';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email does not exist.';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'This password is not correct.';
                break;
        }
        return throwError(errorMessage);
    }
}

export class LoginResponse {
    userName: string;
    photo?: string;
    token: string;
    expiration: Date
}

export class RegisterResponse {

}