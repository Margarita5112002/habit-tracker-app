import { HabitTrackChange } from "../models/habit-track-change.model"
import { HabitTrack } from "../models/habit-track.model"
import { Habit } from "../models/habit.model"
import { addDays, startOfDay } from "./date.utils"

export function applyChangeToHabitTrack(
    tracks: HabitTrack[] | undefined,
    change: HabitTrackChange
): HabitTrack {
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

export function getLastDays(
    tracks: HabitTrack[],
    from: Date,
    ndays: number
): number[] {
    if (ndays <= 0) return []
    if (tracks.length === 0) return new Array(ndays).fill(0)

    const startDate = startOfDay(from)
    const endDate = addDays(startDate, -ndays)
    let iterDate = new Date(startDate)
    let n = 0
    let days: number[] = []

    while (iterDate > endDate) {
        const relevantTrack = tracks.find(
            t => t.month === iterDate.getMonth() + 1
                && t.year === iterDate.getFullYear()
        )
        const take = ndays - n >= iterDate.getDate() ? iterDate.getDate() : ndays - n
        n += take
        if (!relevantTrack) {
            days = days.concat(new Array(take).fill(0))
        } else {
            const end = iterDate.getDate() + 1
            const start = end - take
            const newDays = relevantTrack.days.slice(start, end)
            newDays.reverse()
            days = days.concat(newDays)
        }
        iterDate = addDays(iterDate, -take)
    }
    
    return days
}

export function getCompletionsOnDate(tracks: HabitTrack[], date: Date): number {
    for(const track of tracks) {
        if (track.month - 1 == date.getMonth() && track.year == date.getFullYear())
            return track.days[date.getDate()]
    }
    
    return 0
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

export function getHabitCalculationsForDate(date: Date, habit: Habit): HabitCalculations {
    const tracks = habit.habitTracks ?? []
    const freq = habit.frequencyInDays
    const target = habit.target

    const completionsOnDate = getCompletionsOnDate(tracks, date)
    const completionsDone = getCompletionsInLastDays(tracks, date, freq)
    const completionsDoneNotDate = completionsDone - completionsOnDate
    const leftToDo = Math.max(0, target - completionsDone)
    const leftToDoOnDate = Math.max(0, target - completionsDoneNotDate)
    const completionPercentage = (completionsDone / target) * 100

    return {
        date,
        habitId: habit.id,
        completionPercentage,
        completionsDone,
        completionsDoneNotDate,
        completionsOnDate,
        leftToDo,
        leftToDoOnDate
    }
}

export interface HabitCalculations {
    date: Date,
    habitId: string,
    completionPercentage: number, 
    completionsOnDate: number, 
    completionsDone: number,
    completionsDoneNotDate: number,
    leftToDo: number,
    leftToDoOnDate: number,
}