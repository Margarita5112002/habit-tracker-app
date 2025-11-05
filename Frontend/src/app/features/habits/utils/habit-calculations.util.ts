import { HabitTrackChange } from "../models/habit-track-change.model"
import { HabitTrack } from "../models/habit-track.model"
import { Habit } from "../models/habit.model"
import { addDays, startOfDay } from "./date.utils"

export const applyChangeToHabitTrack = (
    tracks: HabitTrack[] | undefined,
    change: HabitTrackChange
): HabitTrack => {
    tracks ??= []
    const existingTrack = tracks.find(
        t => t.month === change.month && t.year === change.year
    )

    if (existingTrack) {
        const newDays = [...existingTrack.days]
        newDays[change.day] = (newDays[change.day] ?? 0) + change.increment
        return { ...existingTrack, days: newDays }
    }

    const newDays = new Array(32).fill(0)
    newDays[change.day] = change.increment
    return {
        month: change.month,
        year: change.year,
        days: newDays
    }
}

export function calculateCompletionPercentage(habit: Habit, from: Date): number {
    const { frequencyInDays, target } = habit
    const habitTracks = habit.habitTracks ?? []
    const completions = getCompletionsInLastDays(habitTracks, from, frequencyInDays)
    return (completions / target) * 100
}

export function getCompletionsInLastDays(
    tracks: HabitTrack[],
    from: Date,
    ndays: number
): number {
    if (ndays <= 0 || tracks.length === 0) return 0

    const today = startOfDay(from)
    const startDate = addDays(today, -(ndays - 1))

    let total = 0

    for (const track of tracks) {
        const trackStart = new Date(track.year, track.month - 1, 1)
        const trackEnd = new Date(track.year, track.month, 0)

        if (trackEnd < startDate || trackStart > today) continue

        const firstDay = trackStart < startDate ? startDate.getDate() : 1
        const lastDay = trackEnd > today ? today.getDate() : trackEnd.getDate()

        for (let day = firstDay; day <= lastDay; day++) {
            total += track.days[day] ?? 0
        }
    }

    return total
}