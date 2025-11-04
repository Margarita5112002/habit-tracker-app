export function startOfDay(date: Date): Date {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

export function getCurrentDateParts(): DateParts {
    const now = new Date()
    return {
        day: now.getDate(),
        month: now.getMonth() + 1,
        year: now.getFullYear()
    }
}

interface DateParts {
    day: number
    month: number
    year: number
}