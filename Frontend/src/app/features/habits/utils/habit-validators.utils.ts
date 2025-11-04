import { HabitTrackChange } from "../models/habit-track-change.model"

export function isValidTrackChange(change: HabitTrackChange): boolean {
    return isValidMonth(change.month) &&
           isValidDay(change.day) &&
           isValidYear(change.year) &&
           change.increment !== 0
}

export function isValidMonth(month: number): boolean {
    return month >= 1 && month <= 12
}

export function isValidDay(day: number): boolean {
    return day >= 1 && day <= 31
}

export function isValidYear(year: number): boolean {
    return year >= 2020 && year <= new Date().getFullYear() + 1
}