import { Component, inject } from "@angular/core";
import { MenuComponent } from "./menu/menu.component";
import { RouterOutlet } from "@angular/router";
import { HabitIncrementService } from "../habits/services/habit-increment.service";
import { CustomValueInputComponent } from "../../shared/custom-value-input/custom-value-input.component";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [MenuComponent, RouterOutlet, CustomValueInputComponent]
})
export class HomeComponent {
    private readonly habitIncrementService = inject(HabitIncrementService)

    readonly incrementModalConfig = this.habitIncrementService.modalConfig
    
}