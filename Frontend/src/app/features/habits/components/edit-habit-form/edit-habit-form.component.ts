import { Component } from "@angular/core";
import { HabitFormComponent } from "../habit-form/habit-form.component";

@Component({
    selector: 'app-edit-habit-form',
    templateUrl: './edit-habit-form.component.html',
    styleUrl: './edit-habit-form.component.css',
    imports: [HabitFormComponent]
})
export class EditHabitFormComponent {

}