import { Component, computed, inject } from "@angular/core";
import { HabitService } from "../../habits/services/habit.service";
import { HabitCardComponent } from "../../habits/components/habit-card/habit-card.component";
import { HabitStateService } from "../../habits/services/habit-state.service";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    imports: [HabitCardComponent]
})
export class DashboardComponent {
    habitsState = inject(HabitStateService)
    habits = this.habitsState.habits
    loading = computed(() => this.habitsState.loading().read)

    constructor(habitService: HabitService) {
        habitService.initializeHabits().subscribe()
    }

}