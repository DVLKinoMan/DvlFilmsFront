import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

@Component({
    selector: "app-auth",
    templateUrl: "./auth.component.html"
})

export class AuthComponent {
    @Input() error: string | null;
    @Output() submitEM = new EventEmitter();

    form: FormGroup = new FormGroup({
        username: new FormControl(''),
        password: new FormControl(''),
    });

    submit() {
        if (this.form.valid) {
            this.submitEM.emit(this.form.value);
        }
    }
}