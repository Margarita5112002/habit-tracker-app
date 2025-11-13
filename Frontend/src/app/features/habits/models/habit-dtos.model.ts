import { Habit } from "./habit.model"

export interface HabitTrackChangeRequest {
    habitId: string,
    year: number,
    month: number,
    dayUpdates: Record<number, number>
}

export type CreateHabitRequest = Omit<Habit, 'id' | 'habitTracks'>
export type UpdateHabitRequest = Omit<Habit, 'id' | 'habitTracks'>