import { Component, computed, input } from "@angular/core";
import { getLastDays } from "../../utils/habit-calculations.util";
import { getColorWithOpacity } from "../../utils/color.util";
import { Habit } from "../../models/habit.model";
import { addDays } from "../../utils/date.utils";
import { formatDate } from "@angular/common";

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

    getTitleForNode(completions: number, index: number) {
        const today = new Date()
        const day = addDays(today, -index)

        let title = formatDate(day, "dd MMM, YYYY", 'en-US')
        title += completions > 0 ? `. ${completions} done` : ''
        return title
    }

    getColorForNode(day: number) {
        const progress = Math.round((day / this.maxProgressPerDay()) * 100)
        const clamped = progress < 5 ? 5 : (progress > 100 ? 100 : progress)
        return getColorWithOpacity(this.color(), clamped)
    }

}