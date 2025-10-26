import { Component } from "@angular/core";
import { HabitFormComponent } from "../habits/habit-form/habit-form.component";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [HabitFormComponent]
})
export class HomeComponent {
    
}