import { Component, computed, input } from "@angular/core";
import { getLastDays } from "../../utils/habit-calculations.util";
import { getColorWithOpacity } from "../../utils/color.util";
import { Habit } from "../../models/habit.model";

@Component({
    selector: 'app-habit-progress-component',
    templateUrl: './habit-progress-graph.component.html',
    styleUrl: './habit-progress-graph.component.css',
    imports: []
})
export class HabitProgressGraphComponent {
    habit = input.required<Habit>()
    tracks = computed(() => this.habit().habitTracks ?? [])
    color = computed(() => this.habit().color)

    days = computed(() => {
        return getLastDays(this.tracks(), new Date(), 365)
    })
    maxProgressPerDay = computed(() => {
        return Math.ceil(this.habit().target / this.habit().frequencyInDays)
    })

    getColorForNote(day: number) {
        const progress = Math.round((day / this.maxProgressPerDay()) * 100)
        const clamped = progress < 5 ? 5 : (progress > 100 ? 100 : progress)
        return getColorWithOpacity(this.color(), clamped)
    }

}