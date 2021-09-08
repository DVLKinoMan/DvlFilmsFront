import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";

@Injectable({ providedIn: 'root' })
export class AuthService {
    baseUrl = "https://localhost:44338";
    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient,
        private _snackBar: MatSnackBar) {

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

    externalRegister(idToken: string): Observable<RegisterResponse> {
        return this.http.post<RegisterResponse>(this.baseUrl + "/Accounts/ExternalRegister", {
            idToken: idToken,
            provider: "google"
        })
            .pipe(
                catchError(this.handleError),
                tap(resData => {

                })
            );
    }

    autoLogin() {
        const us: User = JSON.parse(localStorage.getItem('userData'));
        if (!us)
            return;

        if (us.token) {
            this.user.next(us);
            this.autoLogout(new Date(us.TokenExpirationDate).getTime() -
                new Date().getTime());
        }
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
                        resData.profilePicture,
                        resData.token,
                        resData.expiration
                    );
                })
            );
    }

    externalLogin(idToken: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.baseUrl + "/Accounts/ExternalLogin", {
            idToken: idToken,
            provider: "google"
        })
            .pipe(
                catchError(this.handleError),
                tap(resData => {
                    this.handleAuthentication(
                        resData.userName,
                        resData.profilePicture,
                        resData.token,
                        resData.expiration
                    );
                })
            );
    }

    logout() {
        this.user.next(null);
        localStorage.removeItem('userData');
        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(
        userName: string,
        photo: string,
        token: string,
        expiration: Date
    ) {
        const user = new User(userName, photo, token, expiration);
        this.user.next(user);
        this.autoLogout(new Date(expiration).getTime() - new Date().getTime());
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError = (errorRes: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred!';
        if (errorRes.error && errorRes.error.message) {
            this.showSnackBar(errorRes.error.message, 'OK');
            return throwError(errorRes.error.message);
        }
        if (!errorRes.error || !errorRes.error.error) {
            this.showSnackBar(errorMessage, 'OK');
            return throwError(errorMessage);
        }
        this.showSnackBar(errorRes.error.error.message, 'OK');
        return throwError(errorRes.error.error.message);
    }

    private showSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 4000
        });
    }
}

export class LoginResponse {
    userName: string;
    profilePicture?: string;
    token: string;
    expiration: Date
}

export class RegisterResponse {

}