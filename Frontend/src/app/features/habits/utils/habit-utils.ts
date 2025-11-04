import { Habit } from "../models/habit"
import { HabitTrack } from "../models/habit-track"

export const getCompletionPercentage = (habit: Habit) => {
    const freq = habit.frequencyInDays
    const target = habit.target
    const completions = getCompletionsInLastDays(habit.habitTracks ?? [], freq)
    return (completions / target) * 100
}

const getCompletionsInLastDays = (tracks: HabitTrack[], ndays: number): number => {
    if (ndays <= 0 || tracks.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (ndays - 1));

    let totalCompletions = 0;

    for (const track of tracks) {
        const trackStartDate = new Date(track.year, track.month - 1, 1);
        const trackEndDate = new Date(track.year, track.month, 0);

        if (trackEndDate < startDate || trackStartDate > today) {
            continue;
        }

        const firstDayToCount = trackStartDate < startDate ? startDate.getDate() : 1;
        const lastDayToCount = trackEndDate > today ? today.getDate() : trackEndDate.getDate();

        for (let day = firstDayToCount; day <= lastDayToCount; day++) {
            totalCompletions += track.days[day] ?? 0;
        }
    }

    return totalCompletions;
}