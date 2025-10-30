import { Component, inject } from "@angular/core";
import { HabitService } from "../../../services/habit.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { HabitCardComponent } from "../../habits/habit-card/habit-card.component";

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css',
    imports: [HabitCardComponent]
})
export class DashboardComponent {
    habitService = inject(HabitService)
    habits = toSignal(this.habitService.habits$, {
        initialValue: []
    })
    loading = toSignal(this.habitService.getReadLoadingObservable(), {
        initialValue: true
    })



}