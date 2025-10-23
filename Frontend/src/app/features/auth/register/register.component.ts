import { Component } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrl: './register.component.css',
    imports: [MatIconModule, RouterLinkActive, RouterLink]
})
export class RegisterComponent {
    passwordVisible = false

    togglePasswordVisibility() {
        this.passwordVisible = !this.passwordVisible
    }

}