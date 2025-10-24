import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../../services/auth.service";
import { HttpErrorResponse } from "@angular/common/http";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css', '../auth-style-shared.css'],
    imports: [ReactiveFormsModule, MatIconModule, RouterLinkActive, RouterLink]
})
export class LoginComponent {
    private fb = inject(FormBuilder)
    private authService = inject(AuthService)
    private router = inject(Router)
    loginForm = this.fb.group({
        'userIdentifier': ['', [
            Validators.required
        ],],
        'password': ['', [
            Validators.required
        ]]
    })
    showPassword = false
    errorMessage: string | null = null
    loading = toSignal(this.authService.getLoginLoadingObservable(), {
        initialValue: true
    })

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
        if (this.loginForm.valid) {
            this.authService.login({
                userIdentifier: this.loginForm.value.userIdentifier ?? "",
                password: this.loginForm.value.password ?? ""
            }).subscribe({
                next: () => {
                    this.router.navigate(['/'])
                },
                error: err => {
                    if (err instanceof HttpErrorResponse)
                        this.handleLoginError(err)
                }
            })
        }
    }

    handleLoginError(err: HttpErrorResponse) {
        this.errorMessage = "Username, email or password is wrong"
    }
}