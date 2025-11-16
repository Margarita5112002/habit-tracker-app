import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from "@angular/core"
import { Habit } from "../../features/habits/models/habit.model"
import { hexToHSL } from "../../features/habits/utils/color.util"

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrl: './calendar.component.css'
})
export class CalendarComponent {
    selectedDate: Date | null = null
    calendarDates: CalendarDate[] = []
    dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    private readonly currentDate = signal(new Date())
    readonly habit = input.required<Habit>()
    readonly dateSelected = output<Date>()
    private readonly currentTrack = computed(() => {
        const date = this.currentDate()
        const tracks = this.habit().habitTracks ?? []
        return tracks.find(t => t.year == date.getFullYear() && t.month === date.getMonth() + 1)
    })

    readonly color = computed(() => this.habit().color)
    readonly hslColor = computed(() => hexToHSL(this.habit().color))
    readonly hoverColor = computed(() => {
        const hsl = hexToHSL(this.color());
        hsl.l = Math.min(hsl.l + 20, 90); // Lighten by 10%
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    })

    ngOnInit() {
        this.generateCalendar()
    }

    constructor() {
        effect(() => this.generateCalendar())
    }

    generateCalendar() {
        const currDate = this.currentDate()
        const year = currDate.getFullYear()
        const month = currDate.getMonth()

        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const prevLastDay = new Date(year, month, 0)

        const firstDayOfWeek = firstDay.getDay()
        const lastDate = lastDay.getDate()
        const prevLastDate = prevLastDay.getDate()

        this.calendarDates = []

        // Previous month days
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevLastDate - i)
            this.calendarDates.push(this.createCalendarDate(date, false))
        }

        // Current month days
        for (let day = 1; day <= lastDate; day++) {
            const date = new Date(year, month, day)
            this.calendarDates.push(this.createCalendarDate(date, true))
        }

        // Next month days
        const remainingDays = 42 - this.calendarDates.length
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day)
            this.calendarDates.push(this.createCalendarDate(date, false))
        }
    }

    createCalendarDate(date: Date, isCurrentMonth: boolean): CalendarDate {
        const today = new Date()
        const isToday = date.toDateString() === today.toDateString()
        const isSelected = this.selectedDate?.toDateString() === date.toDateString()

        return {
            date,
            day: date.getDate(),
            isCurrentMonth,
            isToday,
            isSelected,
            value: this.getValueForDate(date)
        }
    }

    getValueForDate(date: Date): number {
        const days = this.currentTrack()?.days
        return days ? days[date.getDate()] : 0
    }

    onDateClick(calendarDate: CalendarDate) {
        this.selectedDate = calendarDate.date
        this.generateCalendar()

        this.dateSelected.emit(calendarDate.date)
    }

    previousMonth() {
        this.currentDate.update(d => new Date(
            d.getFullYear(),
            d.getMonth() - 1,
            1
        ))
        this.generateCalendar()
    }

    nextMonth() {
        this.currentDate.update(d => new Date(
            d.getFullYear(),
            d.getMonth() + 1,
            1
        ))
        this.generateCalendar()
    }

    canViewNextMonth() {
        const today = new Date()
        const d = this.currentDate()
        const nextMonth = new Date(
            d.getFullYear(),
            d.getMonth() + 1,
            1
        )
        return today >= nextMonth
    }

    getMonthYear(): string {
        return this.currentDate().toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        })
    }

    formatDate(date: Date): string {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }
}

interface CalendarDate {
    date: Date
    day: number
    isCurrentMonth: boolean
    isToday: boolean
    isSelected: boolean
    value: number
}