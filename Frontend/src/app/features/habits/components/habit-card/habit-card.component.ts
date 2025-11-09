import { Component, computed, inject, input } from "@angular/core";
import { NgStyle } from "@angular/common";
import { CircularProgressBarComponent } from "../../../../shared/circular-progress-bar/circular-progress-bar.component";
import { HabitService } from "../../services/habit.service";
import { Habit } from "../../models/habit.model";
import { calculateCompletionPercentage, getCompletionsInLastDays, getCompletionsOnDate } from "../../utils/habit-calculations.util";
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
    private today = new Date()

    percentage = computed(() => {
        return calculateCompletionPercentage(this.habit(), this.today)
    })
    todaySummary = computed(() => {
        const tracks = this.habit().habitTracks ?? []
        const target = this.habit().target
        const freq = this.habit().frequencyInDays
        const completionsToday = getCompletionsOnDate(tracks, this.today)
        const completionsDone = getCompletionsInLastDays(tracks, this.today, freq)
        const left =  completionsDone >= target ? 0 : target - completionsDone
        let days = ""
        if (left == 0) {
            days = "All done for "
        } else {
            days = `${left} left `
        }
        switch(freq) {
            case 7: 
                days += "this week"
                break;
            case 30:
                days += "this month"
                break;
            case 1:
                days += left == 0 ? "today" : "for today"
                break;
            default:
                days += left == 0 ? `these ${freq} days` : `in the next ${freq} days`
        }

        return `Today ${completionsToday} done • ${days}`
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