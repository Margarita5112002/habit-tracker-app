import { Component, computed, inject, signal } from "@angular/core";
import { HabitService } from "../../habits/services/habit.service";
import { HabitCardComponent } from "../../habits/components/habit-card/habit-card.component";
import { HabitStateService } from "../../habits/services/habit-state.service";
import { calculateCompletionPercentage } from "../../habits/utils/habit-calculations.util";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    imports: [HabitCardComponent]
})
export class DashboardComponent {
    private readonly habitsState = inject(HabitStateService)
    private readonly today = new Date()
    private readonly SEE_ALL_HABITS = "all"
    private readonly SEE_PENDING_HABITS = "pending"
    private readonly SEE_DONE_HABITS = "done"
    private readonly see = signal(this.SEE_ALL_HABITS)

    readonly habits = computed(() => this.habitsState.habits().map(h => {
        return { ...h, completation: calculateCompletionPercentage(h, this.today) }
    }))
    readonly loading = computed(() => this.habitsState.loading().read)
    readonly filteredHabits = computed(() => {
        const habits = this.habits()
        switch (this.see()) {
            case this.SEE_PENDING_HABITS:
                return habits.filter(h => h.completation < 100)
            case this.SEE_DONE_HABITS:
                return habits.filter(h => h.completation >= 100)
        }
        return habits
    })

    constructor(habitService: HabitService) {
        habitService.initializeHabits().subscribe()
    }

    onDoneClick() { this.see.set(this.SEE_DONE_HABITS) }
    onPendingClick() { this.see.set(this.SEE_PENDING_HABITS) }
    onAllClick() { this.see.set(this.SEE_ALL_HABITS) }

}