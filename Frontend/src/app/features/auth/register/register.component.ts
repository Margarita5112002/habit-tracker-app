import { Component, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from "../../../services/auth.service";
import { HttpErrorResponse } from "@angular/common/http";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css', '../auth-style-shared.css'],
    imports: [ReactiveFormsModule, MatIconModule, RouterLinkActive, RouterLink]
})
export class RegisterComponent {
    authService = inject(AuthService)
    router = inject(Router)
    fb = inject(FormBuilder)

    private usedEmails: string[] = []
    private usedUsernames: string[] = []
    private conflictValidator = (used: string[]) => (control: AbstractControl): ValidationErrors | null => {
        return used.includes(control.value) ?
            { conflict: { value: control.value } } : null;
    }

    registerForm = this.fb.group({
        'username': ['', [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(50),
            Validators.pattern("[^@]+"), // cannot contain @
            this.conflictValidator(this.usedUsernames)
        ]],
        'email': ['', [
            Validators.required,
            Validators.email,
            this.conflictValidator(this.usedEmails)
        ]],
        'password': ['', [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(150)
        ]]
    })

    showPassword = false
    loading = toSignal(this.authService.getRegisterLoadingObservable(), {
        initialValue: true
    })

    get UsernameControl() {
        return this.registerForm.controls.username
    }
    get EmailControl() {
        return this.registerForm.controls.email
    }
    get PasswordControl() {
        return this.registerForm.controls.password
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword
    }

    onSubmit(e: SubmitEvent) {
        if (this.registerForm.valid) {
            const email = this.registerForm.value.email ?? ""
            const username = this.registerForm.value.username ?? ""
            this.authService.register({
                username: username,
                email: email,
                password: this.registerForm.value.username ?? ""
            }).subscribe({
                next: data => {
                    this.router.navigate(['/'])
                },
                error: err => {
                    if (err instanceof HttpErrorResponse &&
                        "errors" in err.error &&
                        err.status == 409) {
                        const errors = err.error.errors
                        if ("Email" in errors) {
                            this.usedEmails.push(email)
                            this.EmailControl.updateValueAndValidity()
                        }
                        if ("Username" in errors) {
                            this.usedUsernames.push(username)
                            this.UsernameControl.updateValueAndValidity()
                        }
                    }
                }
            })
        }
    }

}