import { HabitTrack } from "./habit-track.model";

export interface Habit {
    id: string,
    name: string,
    description: string | null,
    color: string,
    emoji: string,
    target: number,
    frequencyInDays: number,
    allowCustomValue: boolean,
    allowExceedTarget: boolean,
    habitTracks?: HabitTrack[]
}