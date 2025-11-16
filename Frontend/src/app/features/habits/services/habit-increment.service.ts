import { inject, Injectable, signal } from "@angular/core";
import { Habit } from "../models/habit.model";
import { getHabitCalculationsForDate, HabitCalculations } from "../utils/habit-calculations.util";
import { HabitService } from "./habit.service";
import { formatDate } from "@angular/common";

@Injectable({
    providedIn: 'root'
})
export class HabitIncrementService {
    private readonly habitService = inject(HabitService)
    private readonly modalConfigState = signal<CustomValueInputConfig | null>(null)

    readonly modalConfig = this.modalConfigState.asReadonly()

    private openModal(date: Date, habit: Habit, calculations: HabitCalculations) {
        this.modalConfigState.set({
            min: 0,
            target: habit.allowExceedTarget ? calculations.leftToDoOnDate : Math.max(calculations.leftToDoOnDate, calculations.completionsOnDate),
            initialValue: calculations.completionsOnDate,
            progressColor: habit.color,
            allowExceedTarget: habit.allowExceedTarget,
            title: this.getModalTitle(date, habit),
            onClose: (value) => this.closeModal(date, habit, calculations, value)
        })
    }

    private getModalTitle(date: Date, habit: Habit) {
        const name = habit.name
        const dateStr = formatDate(date, "dd MMM, yyyy", 'en-US')

        return `${name}, ${dateStr}. how much completions have you done today?`
    }

    private closeModal(
        date: Date,
        habit: Habit,
        calculations: HabitCalculations,
        newCompletionsForDate: number
    ) {
        const allowExceedTarget = habit.allowExceedTarget
        const target = habit.target
        const done = calculations.completionsDoneNotDate
        const doneToday = calculations.completionsOnDate

        this.modalConfigState.set(null)

        if (doneToday == newCompletionsForDate) return

        const maxval = Math.max(target, doneToday + done)
        let increment = 0
        if (!allowExceedTarget && newCompletionsForDate + done > maxval) {
            increment = maxval - done - doneToday
        } else if (newCompletionsForDate < 0) {
            increment = 0 - doneToday
        } else {
            increment = newCompletionsForDate - doneToday
        }
        
        this.incrementBy(date, habit, increment)
    }

    private incrementBy(date: Date, habit: Habit, increment: number) {
        const day = date.getDate()
        const month = date.getMonth() + 1
        const year = date.getFullYear()
        this.habitService.incrementTrack({ habitId: habit.id, year, month, day, increment })
    }

    handleIncrement(date: Date, habit: Habit, calculations: HabitCalculations | null = null) {
        if (calculations == null) {
            calculations = getHabitCalculationsForDate(date, habit)
        }

        if (calculations.completionPercentage >= 100 || habit.allowCustomValue) {
            this.openModal(date, habit, calculations)
        } else {
            this.incrementBy(date, habit, 1)
        }
    }

}

interface CustomValueInputConfig {
    min: number,
    target: number,
    title: string,
    initialValue: number,
    progressColor: string,
    allowExceedTarget: boolean,
    onClose: (value: number) => void
}