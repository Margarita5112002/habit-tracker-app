import { Component, input } from "@angular/core";
import { Habit } from "../../../shared/models/habit";
import { NgStyle } from "@angular/common";
import { CircularProgressBarComponent } from "../../../shared/circular-progress-bar/circular-progress-bar.component";

@Component({
    selector: 'app-habit-card',
    templateUrl: './habit-card.component.html',
    styleUrl: './habit-card.component.css',
    imports: [NgStyle, CircularProgressBarComponent]
})
export class HabitCardComponent {
    habit = input.required<Habit>()

    getVariantColor(str: string) {
        return this.habit().color + str
    }

    get styles() {
        return {
            'background-color': this.getVariantColor("20"),
        }
    }

}