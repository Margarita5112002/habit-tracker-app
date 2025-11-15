import { ChangeDetectionStrategy, Component, computed, inject, input } from "@angular/core";
import { NgStyle } from "@angular/common";
import { CircularProgressBarComponent } from "../../../../shared/circular-progress-bar/circular-progress-bar.component";
import { HabitService } from "../../services/habit.service";
import { Habit } from "../../models/habit.model";
import { HabitProgressGraphComponent } from "../habit-progress-graph/habit-progress-graph.component";
import { FormsModule } from "@angular/forms";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { HabitIncrementService } from "../../services/habit-increment.service";
import { getHabitCalculationsForDate } from "../../utils/habit-calculations.util";

@Component({
    selector: 'app-habit-card',
    templateUrl: './habit-card.component.html',
    styleUrl: './habit-card.component.css',
    imports: [
        NgStyle,
        FormsModule,
        RouterLink,
        RouterLinkActive,
        CircularProgressBarComponent,
        HabitProgressGraphComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HabitCardComponent {
    private today = new Date()
    readonly habitService = inject(HabitService)
    readonly habitIncrementService = inject(HabitIncrementService)
    readonly habit = input.required<Habit>()

    readonly habitUrl = computed(() => {
        const id = this.habit().id
        return '/habit/' + id
    })

    readonly habitCalculations = computed(() => {
        return getHabitCalculationsForDate(this.today, this.habit())
    })

    readonly leftToDo = computed(() => this.habitCalculations().leftToDo)
    readonly completionsToday = computed(() =>
        this.habitCalculations().completionsOnDate)
    readonly percentage = computed(() => 
        this.habitCalculations().completionPercentage)
    readonly isCompleted = computed(() => this.percentage() >= 100)

    readonly todaySummary = computed(() => {
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
    readonly styles = computed(() => {
        return {
            'background-color': this.getVariantColor("20"),
        }
    })

    getVariantColor(str: string) {
        return this.habit().color + str
    }

    onIncrementClick() {
        this.habitIncrementService.handleIncrement(this.today, this.habit(), this.habitCalculations())
    }

}