import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GoogleLoginProvider, SocialAuthService } from "angularx-social-login";
import { MyErrorStateMatcher } from "../common/myErrorStateMatcher";
import { AuthService } from "./auth.service";

@Component({
    selector: "app-auth",
    templateUrl: "./auth.component.html",
    styleUrls: ['./auth.component.css']
})

export class AuthComponent {
    @Input() error: string | null;
    @Output() submitEM = new EventEmitter();
    isLoading = false;
    loginMode = true;
    matcher = new MyErrorStateMatcher();

    emailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);

    constructor(private authService: AuthService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private socialAuthService: SocialAuthService) {

    }
    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe(
            params => {
                var registerMode = params['registerMode'];
                if (registerMode)
                    this.loginMode = false;
            }
        );
    }

    checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        this.error = null;
        let pass = group.get('password').value;
        let confirmPass = group.get('confirmPassword').value;
        if (pass === confirmPass)
            return null;
        this.error = "Passwords do not match";
        return { notSame: true }
    }

    loginForm: FormGroup = new FormGroup({
        username: new FormControl('', [Validators.required]),
        password: new FormControl('', [Validators.required]),
    });

    registrationForm: FormGroup = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]),
        password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]),
        confirmPassword: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        birthDate: new FormControl('', [Validators.required])
    }, { validators: this.checkPasswords });


    onLoginSubmit() {
        if (this.loginMode && !this.loginForm.valid)
            return;

        const userName = this.loginForm.value.username;
        const password = this.loginForm.value.password;

        this.isLoading = true;

        this.authService.login(userName, password)
            .subscribe(res => {
                console.log(res);
                this.isLoading = false;
                this.activatedRoute.queryParams.subscribe(
                    params => {
                        var url = params['returnUrl'];
                        if (url)
                            this.router.navigate([url]);
                        else this.router.navigate(["/films"]);
                    }
                );
            }, error => {
                console.log(error);
                this.error = error;
                this.isLoading = false;
            });

        this.loginForm.reset();
    }

    onRegisterSubmit() {
        if (!this.loginMode && !this.registrationForm.valid)
            return;

        const userName = this.registrationForm.value.username;
        const password = this.registrationForm.value.password;
        const email = this.registrationForm.value.email;
        const birthDate = this.registrationForm.value.birthDate;

        this.isLoading = true;

        this.authService.register(userName, password, email, birthDate)
            .subscribe(res => {
                console.log(res);
                this.isLoading = false;
                this.loginMode = true;
                this.registrationForm.reset();
            }, error => {
                console.log(error);
                this.error = error;
                this.isLoading = false;
            });
    }

    loginWithGoogle(): void {
        this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
            .then(() => this.router.navigate(['films']))
            .catch(reason => {
                console.log(reason);
            });
    }
}