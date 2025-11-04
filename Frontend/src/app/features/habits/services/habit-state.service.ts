import { Injectable, signal } from "@angular/core";
import { Habit } from "../models/habit.model";
import { HabitTrack } from "../models/habit-track.model";

@Injectable({
    providedIn: 'root'
})
export class HabitStateService {
    private readonly habitsState = signal<Habit[]>([]);
    private readonly loadingState = signal<LoadingState>({
        read: false,
        create: false,
        update: false,
        delete: false
    });
    private readonly errorState = signal<string | null>(null);

    readonly habits = this.habitsState.asReadonly();
    readonly loading = this.loadingState.asReadonly();
    readonly error = this.errorState.asReadonly();

    setHabits(habits: Habit[]): void {
        this.habitsState.set(habits);
    }

    addHabit(habit: Habit): void {
        this.habitsState.update(habits => [...habits, habit]);
    }

    updateHabit(id: string, updates: Partial<Habit>): void {
        this.habitsState.update(habits =>
            habits.map(h => h.id === id ? { ...h, ...updates } : h)
        );
    }

    removeHabit(id: string): void {
        this.habitsState.update(habits => habits.filter(h => h.id !== id));
    }

    updateHabitTrack(habitId: string, track: HabitTrack): void {
        this.habitsState.update(habits =>
            habits.map(habit => {
                if (habit.id !== habitId) return habit;

                const tracks = habit.habitTracks ?? [];
                const trackIndex = tracks.findIndex(
                    t => t.month === track.month && t.year === track.year
                );

                const updatedTracks = trackIndex !== -1
                    ? [...tracks.slice(0, trackIndex), track, ...tracks.slice(trackIndex + 1)]
                    : [...tracks, track];

                return { ...habit, habitTracks: updatedTracks };
            })
        );
    }

    setLoading(operation: keyof LoadingState, value: boolean): void {
        this.loadingState.update(state => ({ ...state, [operation]: value }));
    }

    setError(error: string | null): void {
        this.errorState.set(error);
    }

    getHabitById(id: string): Habit | undefined {
        return this.habitsState().find(h => h.id === id);
    }

}

interface LoadingState {
    read: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
}