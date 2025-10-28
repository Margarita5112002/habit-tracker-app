import { Component } from "@angular/core";
import { HabitFormComponent, HabitSubmitted } from "../habit-form/habit-form.component";

@Component({
    selector: 'app-create-habit-form',
    templateUrl: './create-habit-form.component.html',
    styleUrls: ['./create-habit-form.component.css'],
    imports: [HabitFormComponent]
})
export class CreateHabitFormComponent {

    onSubmit(habit: HabitSubmitted) {
        console.log(habit)
    }

    onCancel() {
        console.log("cancel habit creation")
    }

}
