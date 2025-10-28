import { Component } from "@angular/core";
import { CreateHabitFormComponent } from "../habits/create-habit-form/create-habit-form.component";

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    imports: [CreateHabitFormComponent]
})
export class HomeComponent {
    
}