import { HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { exhaustMap, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

    constructor(private authService: AuthService) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return this.authService.user.pipe(
            take(1),
            exhaustMap(user => {
                if (!user)
                    return next.handle(req);

                var headers = new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': "Bearer " + user.token
                });

                if (req.headers.has("InterceptorSkipContentType")) {
                    headers = req.headers.delete("InterceptorSkipContentType");
                    headers = headers.append('Authorization', "Bearer " + user.token);
                }

                const modifiedReq = req.clone({
                    headers: headers
                });
                return next.handle(modifiedReq);
            })
        )
    }
}