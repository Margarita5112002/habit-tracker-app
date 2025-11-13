import { Component, computed, inject, input, signal } from "@angular/core";
import { HabitCardComponent } from "../habit-card/habit-card.component";
import { MatIconModule } from "@angular/material/icon";
import { ConfirmModalComponent } from "../../../../shared/confirm-modal/confirm-modal.component";
import { HabitService } from "../../services/habit.service";
import { HabitStateService } from "../../services/habit-state.service";
import { Router } from "@angular/router";

@Component({
    selector: 'app-habit-view',
    templateUrl: './habit-view.component.html',
    styleUrl: './habit-view.component.css',
    imports: [HabitCardComponent, MatIconModule, ConfirmModalComponent]
})
export class HabitViewComponent {
    readonly router = inject(Router)
    readonly habitService = inject(HabitService)
    readonly habitState = inject(HabitStateService)
    readonly habitId = input.required<string>() 
    readonly confirmDeleteHabitModalOpen = signal(false)
    readonly confirmDeleteHabitModalMessage = 'Are you sure you want to delete this habit?'

    readonly habit = computed(() => 
        this.habitState.getHabitById(this.habitId())!)

    onDeleteClick() {
        this.confirmDeleteHabitModalOpen.set(true)
    }

    onCancelDeleteHabit() {
        this.confirmDeleteHabitModalOpen.set(false)
    }

    onConfirmDeleteHabit() {
        this.confirmDeleteHabitModalOpen.set(false)
        this.habitService.deleteHabit(this.habitId()).subscribe({
            next: () => {
                this.router.navigate(["/"])
            },
            error: () => {
                alert('Something went wrong trying to delete habit :c')
            }
        })
    }

}