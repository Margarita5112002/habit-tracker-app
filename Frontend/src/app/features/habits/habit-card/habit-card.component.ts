import { Component, computed, inject, input } from "@angular/core";
import { Habit } from "../../../shared/models/habit";
import { NgStyle } from "@angular/common";
import { CircularProgressBarComponent } from "../../../shared/circular-progress-bar/circular-progress-bar.component";
import { HabitService } from "../../../services/habit.service";
import { getCompletionPercentage } from "../../../shared/models/habit-utils";

@Component({
    selector: 'app-habit-card',
    templateUrl: './habit-card.component.html',
    styleUrl: './habit-card.component.css',
    imports: [NgStyle, CircularProgressBarComponent]
})
export class HabitCardComponent {
    habitService = inject(HabitService)
    habit = input.required<Habit>()

    totalIncrements = computed(() => 
        this.habit().habitTracks?.reduce((p, c) => p + c.days.reduce((pd, cd) => pd + cd), 0) ?? 0
    )
    percentage = computed(() => {
        return getCompletionPercentage(this.habit())
    })

    getVariantColor(str: string) {
        return this.habit().color + str
    }

    get styles() {
        return {
            'background-color': this.getVariantColor("20"),
        }
    }

    onIncrementClick() {
        const d = new Date()
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        this.habitService.incrementTrack({habitId: this.habit().id, year, month, day, increment: 1})
    }

}