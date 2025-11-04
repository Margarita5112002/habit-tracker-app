import { Component, inject } from "@angular/core";
import { HabitFormComponent, HabitSubmitted } from "../habit-form/habit-form.component";
import { HabitService } from "../../services/habit.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-create-habit-form',
    templateUrl: './create-habit-form.component.html',
    styleUrls: ['./create-habit-form.component.css'],
    imports: [HabitFormComponent]
})
export class CreateHabitFormComponent {
    habitService = inject(HabitService)
    router = inject(Router)

    onSubmit(habit: HabitSubmitted) {
        this.habitService.createHabit({
            ...habit,
            frequencyInDays: habit.frequency
        }).subscribe({
            next: data => {
                this.router.navigate(['/'])
            },
            error: err => {
                console.log("error creating habit", err)
                this.router.navigate(['/'])
            }
        })
    }

    onCancel() {
        this.router.navigate(['/'])
    }

}
