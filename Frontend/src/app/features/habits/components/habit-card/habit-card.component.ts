import { Component, computed, inject, input } from "@angular/core";
import { NgStyle } from "@angular/common";
import { CircularProgressBarComponent } from "../../../../shared/circular-progress-bar/circular-progress-bar.component";
import { HabitService } from "../../services/habit.service";
import { Habit } from "../../models/habit.model";
import { calculateCompletionPercentage } from "../../utils/habit-calculations.util";
import { HabitProgressGraphComponent } from "../habit-progress-graph/habit-progress-graph.component";

@Component({
    selector: 'app-habit-card',
    templateUrl: './habit-card.component.html',
    styleUrl: './habit-card.component.css',
    imports: [NgStyle, CircularProgressBarComponent, HabitProgressGraphComponent]
})
export class HabitCardComponent {
    habitService = inject(HabitService)
    habit = input.required<Habit>()

    percentage = computed(() => {
        return calculateCompletionPercentage(this.habit(), new Date())
    })
    isCompleted = computed(() => this.percentage() >= 100)
    styles = computed(() => {
        return {
            'background-color': this.getVariantColor("20"),
        }
    })

    getVariantColor(str: string) {
        return this.habit().color + str
    }

    private increment(increment: number) {
        const d = new Date()
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        this.habitService.incrementTrack({habitId: this.habit().id, year, month, day, increment})
    
    }

    onIncrementClick() {
        this.increment(1)
    }
    
    onCompleteClick() {
        if(this.habit().allowExceedTarget) {
           this.increment(1)
        }
    }

}