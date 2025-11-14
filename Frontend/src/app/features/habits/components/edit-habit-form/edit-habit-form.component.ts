import { Component, computed, inject, input } from "@angular/core";
import { HabitFormComponent } from "../habit-form/habit-form.component";
import { HabitStateService } from "../../services/habit-state.service";
import { Habit } from "../../models/habit.model";
import { HabitService } from "../../services/habit.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-edit-habit-form',
    templateUrl: './edit-habit-form.component.html',
    styleUrl: './edit-habit-form.component.css',
    imports: [HabitFormComponent]
})
export class EditHabitFormComponent {
    private readonly habitService = inject(HabitService)
    private readonly habitState = inject(HabitStateService)
    private readonly router = inject(Router)
    readonly habitId = input.required<string>()

    readonly loading = computed(() => this.habitState.loading().update)
    readonly habit = computed(() =>
        this.habitState.getHabitById(this.habitId())!)

    onSubmit(data: Omit<Habit, 'id'>) {
        this.habitService.updateHabit(this.habitId(), data)
            .subscribe({
                next: () => {
                    this.router.navigate(['/', 'habit', this.habitId()])
                }
            })
    }

    onCancel() {
        this.router.navigate(['/'])
    }
}