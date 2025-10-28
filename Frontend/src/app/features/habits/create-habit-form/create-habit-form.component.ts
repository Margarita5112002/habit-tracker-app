import { Component, inject } from "@angular/core";
import { HabitFormComponent, HabitSubmitted } from "../habit-form/habit-form.component";
import { HabitService } from "../../../services/habit.service";

@Component({
    selector: 'app-create-habit-form',
    templateUrl: './create-habit-form.component.html',
    styleUrls: ['./create-habit-form.component.css'],
    imports: [HabitFormComponent]
})
export class CreateHabitFormComponent {
    habitService = inject(HabitService)

    onSubmit(habit: HabitSubmitted) {
        this.habitService.createHabit({
            ...habit,
            frequencyInDays: habit.frequency
        }).subscribe({
            next: data => {
                console.log("creating habit sucess")
            },
            error: err => {
                console.log("error creating habit", err)
            }
        })
    }

    onCancel() {
        console.log("cancel habit creation")
    }

}
