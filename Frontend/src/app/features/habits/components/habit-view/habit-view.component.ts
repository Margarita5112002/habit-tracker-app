import { Component, computed, input } from "@angular/core";
import { Habit } from "../../models/habit.model";
import { HabitCardComponent } from "../habit-card/habit-card.component";
import { MatIconModule } from "@angular/material/icon";

@Component({
    selector: 'app-habit-view',
    templateUrl: './habit-view.component.html',
    styleUrl: './habit-view.component.css',
    imports: [HabitCardComponent, MatIconModule]
})
export class HabitViewComponent {
    readonly habit = input.required<Habit>()

    readonly habitColor = computed(() => this.habit().color)
    readonly emoji = computed(() => this.habit().emoji)

}