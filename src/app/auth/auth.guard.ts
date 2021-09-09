import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService,
        private router: Router,
        private _snackBar: MatSnackBar
    ) {

    }

    canActivate(route: ActivatedRouteSnapshot,
        router: RouterStateSnapshot): | boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
        return this.authService.user.pipe(
            take(1),
            map(user => {
                const isAuth = !!user;
                if (isAuth)
                    return true;
                this._snackBar.open("You must login to access this page", "Ok", { duration: 4000 });
                return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: route.url.join('/') } });
            })
        );
    }
}