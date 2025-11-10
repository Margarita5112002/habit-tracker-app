import { Component, computed, inject, input } from "@angular/core";
import { formatDate, NgStyle } from "@angular/common";
import { CircularProgressBarComponent } from "../../../../shared/circular-progress-bar/circular-progress-bar.component";
import { HabitService } from "../../services/habit.service";
import { Habit } from "../../models/habit.model";
import { calculateCompletionPercentage, getCompletionsInLastDays, getCompletionsOnDate } from "../../utils/habit-calculations.util";
import { HabitProgressGraphComponent } from "../habit-progress-graph/habit-progress-graph.component";
import { CustomValueInputComponent } from "../../../../shared/custom-value-input/custom-value-input.component";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-habit-card',
    templateUrl: './habit-card.component.html',
    styleUrl: './habit-card.component.css',
    imports: [
        NgStyle,
        FormsModule,
        CustomValueInputComponent,
        CircularProgressBarComponent,
        HabitProgressGraphComponent
    ]
})
export class HabitCardComponent {
    private today = new Date()
    habitService = inject(HabitService)
    habit = input.required<Habit>()

    percentage = computed(() => {
        return calculateCompletionPercentage(this.habit(), this.today)
    })
    tracks = computed(() => this.habit().habitTracks ?? [])
    completionsToday = computed(() => getCompletionsOnDate(this.tracks(), this.today))
    todaySummary = computed(() => {
        const target = this.habit().target
        const freq = this.habit().frequencyInDays
        const completionsDone = getCompletionsInLastDays(this.tracks(), this.today, freq)
        const left = completionsDone >= target ? 0 : target - completionsDone
        let days = ""
        if (left == 0) {
            days = "All done for "
        } else {
            days = `${left} left `
        }
        switch (freq) {
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

        return `Today ${this.completionsToday()} done • ${days}`
    })
    isCompleted = computed(() => this.percentage() >= 100)
    styles = computed(() => {
        return {
            'background-color': this.getVariantColor("20"),
        }
    })

    customValueInputOpen = false
    customValueInputTitle = computed(() => {
        const date = formatDate(this.today, "dd MMM, yyyy", 'en-US')
        const name = this.habit().name
        return `${name}, ${date}`
    })
    customValue = 0

    getVariantColor(str: string) {
        return this.habit().color + str
    }

    private openCustomValueInput() {
        this.customValue = this.completionsToday()
        this.customValueInputOpen = true
    }

    onCustomValueInputClose() {
        this.customValueInputOpen = false
        if (this.customValue < 0) return
        const currval = this.completionsToday()
        if (currval == this.customValue) return
        this.increment(this.customValue - currval)
    }

    private increment(increment: number) {
        const d = new Date()
        const day = d.getDate()
        const month = d.getMonth() + 1
        const year = d.getFullYear()
        this.habitService.incrementTrack({ habitId: this.habit().id, year, month, day, increment })

    }

    onIncrementClick() {
        if (this.habit().allowCustomValue) {
            this.openCustomValueInput()
        } else this.increment(1)
    }

    onCompleteClick() {
        this.openCustomValueInput()
    }

}