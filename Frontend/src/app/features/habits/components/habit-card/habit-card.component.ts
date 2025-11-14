import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from "@angular/core";
import { formatDate, NgStyle } from "@angular/common";
import { CircularProgressBarComponent } from "../../../../shared/circular-progress-bar/circular-progress-bar.component";
import { HabitService } from "../../services/habit.service";
import { Habit } from "../../models/habit.model";
import { calculateCompletionPercentage, getCompletionsInLastDays, getCompletionsOnDate } from "../../utils/habit-calculations.util";
import { HabitProgressGraphComponent } from "../habit-progress-graph/habit-progress-graph.component";
import { CustomValueInputComponent } from "../../../../shared/custom-value-input/custom-value-input.component";
import { FormsModule } from "@angular/forms";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
    selector: 'app-habit-card',
    templateUrl: './habit-card.component.html',
    styleUrl: './habit-card.component.css',
    imports: [
        NgStyle,
        FormsModule,
        RouterLink,
        RouterLinkActive,
        CustomValueInputComponent,
        CircularProgressBarComponent,
        HabitProgressGraphComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitCardComponent {
    private today = new Date()
    habitService = inject(HabitService)
    habit = input.required<Habit>()

    habitUrl = computed(() => {
        const id = this.habit().id
        return '/habit/' + id
    })
    percentage = computed(() => {
        return calculateCompletionPercentage(this.habit(), this.today)
    })
    tracks = computed(() => this.habit().habitTracks ?? [])
    completionsToday = computed(() => getCompletionsOnDate(this.tracks(), this.today))
    completionsDone = computed(() => {
        const freq = this.habit().frequencyInDays
        return getCompletionsInLastDays(this.tracks(), this.today, freq)
    })
    completionsDoneNotToday = computed(() =>
        this.completionsDone() - this.completionsToday())
    leftToDo = computed(() => {
        const target = this.habit().target
        const done = this.completionsDone()
        return Math.max(0, target - done)
    })
    leftToDoToday = computed(() => {
        const target = this.habit().target
        const done = this.completionsDoneNotToday()
        return Math.max(0, target - done)
    })
    completionsLimitToday = computed(() => {
        return Math.max(this.leftToDoToday(), this.completionsToday())
    })
    todaySummary = computed(() => {
        const freq = this.habit().frequencyInDays
        const left = this.leftToDo()
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

    customValueInputOpen = signal(false)
    customValueInputTitle = computed(() => {
        const name = this.habit().name
        const date = formatDate(this.today, "dd MMM, yyyy", 'en-US')

        return `${name}, ${date}. how much completions have you done today?`
    })
    initialCustomValue = signal(0)

    getVariantColor(str: string) {
        return this.habit().color + str
    }

    private openCustomValueInput() {
        this.initialCustomValue.set(this.completionsToday())
        this.customValueInputOpen.set(true)
    }

    onCustomValueInputClose(value: number) {
        const allowExceedTarget = this.habit().allowExceedTarget
        const target = this.habit().target
        const done = this.completionsDoneNotToday()
        const doneToday = this.completionsToday()
        this.customValueInputOpen.set(false)

        if (doneToday == value) return

        const maxval = Math.max(target, doneToday + done)
        if (!allowExceedTarget && value + done > maxval) {
            console.log("max reach", maxval)
            this.increment(maxval - done - doneToday)
        } else if (value < 0) {
            this.increment(0 - doneToday)
        } else {
            this.increment(value - doneToday)
        }

    }

    private increment(increment: number) {
        const day = this.today.getDate()
        const month = this.today.getMonth() + 1
        const year = this.today.getFullYear()
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