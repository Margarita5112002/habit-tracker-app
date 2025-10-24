import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css', '../auth-style-shared.css'],
    imports: [ReactiveFormsModule, MatIconModule, RouterLinkActive, RouterLink]
})
export class LoginComponent {
    private fb = inject(FormBuilder)
    loginForm = this.fb.group({
        'userIdentifier': ['', [
            Validators.required
        ],],
        'password': ['', [
            Validators.required
        ]]
    })
    showPassword = false

    get UserIdentifierControl() {
        return this.loginForm.controls.userIdentifier
    }

    get PasswordControl() {
        return this.loginForm.controls.password
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword
    }

    onSubmit(e: SubmitEvent) {

    }
}