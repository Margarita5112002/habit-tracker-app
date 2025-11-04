import { Component, computed, inject } from "@angular/core";
import { HabitFormComponent } from "../habit-form/habit-form.component";
import { HabitService } from "../../services/habit.service";
import { Router } from "@angular/router";
import { Habit } from "../../models/habit.model";
import { HabitStateService } from "../../services/habit-state.service";

@Component({
    selector: 'app-create-habit-form',
    templateUrl: './create-habit-form.component.html',
    styleUrls: ['./create-habit-form.component.css'],
    imports: [HabitFormComponent]
})
export class CreateHabitFormComponent {
    habitService = inject(HabitService)
    habitState = inject(HabitStateService)
    router = inject(Router)

    loading = computed(() => this.habitState.loading().create)

    onSubmit(habit: Omit<Habit, 'id'>) {
        this.habitService.createHabit({
            ...habit
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
