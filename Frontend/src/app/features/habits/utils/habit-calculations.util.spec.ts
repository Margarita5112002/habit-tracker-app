import { HabitTrackChange } from "../models/habit-track-change.model"
import { HabitTrack } from "../models/habit-track.model"
import { Habit } from "../models/habit.model"
import { applyChangeToHabitTrack, calculateCompletionPercentage, getCompletionsInLastDays } from "./habit-calculations.util"

describe('habit calculations', () => {
    describe('applyChangeToHabitTrack', () => {
        it('undefine track return new track', () => {
            const tracks = undefined
            const change: HabitTrackChange = {
                habitId: '',
                month: 10,
                year: 2020,
                day: 30,
                increment: 3
            }
            const days = new Array(32).fill(0)
            days[change.day] = change.increment
            const result: HabitTrack = {
                month: change.month,
                year: change.year,
                days
            }

            expect(applyChangeToHabitTrack(tracks, change)).toEqual(result)
        })

        it('empty tracks return new track', () => {
            const tracks: HabitTrack[] = []
            const change: HabitTrackChange = {
                habitId: '',
                month: 12,
                year: 2025,
                day: 1,
                increment: 1
            }
            const days = new Array(32).fill(0)
            days[change.day] = change.increment
            const result: HabitTrack = {
                month: change.month,
                year: change.year,
                days
            }

            expect(applyChangeToHabitTrack(tracks, change)).toEqual(result)
        })

        it('there is one track that does not overlap return new track', () => {
            const tracks: HabitTrack[] = [{
                month: 12,
                year: 2025,
                days: new Array(32).fill(0)
            }]
            const change: HabitTrackChange = {
                habitId: '',
                month: 11,
                year: 2025,
                day: 1,
                increment: 1
            }
            const days = new Array(32).fill(0)
            days[change.day] = change.increment
            const result: HabitTrack = {
                month: change.month,
                year: change.year,
                days
            }

            expect(applyChangeToHabitTrack(tracks, change)).toEqual(result)
        })

        it('there is one track that overlap return a merged track', () => {
            const tracks: HabitTrack[] = [{
                month: 5,
                year: 2023,
                days: new Array(32).fill(0)
            }]
            tracks[0].days[10] = 10
            const change: HabitTrackChange = {
                habitId: '',
                month: 5,
                year: 2023,
                day: 10,
                increment: 5
            }
            const days = new Array(32).fill(0)
            days[change.day] = change.increment + tracks[0].days[10]
            const result: HabitTrack = {
                month: change.month,
                year: change.year,
                days
            }

            expect(applyChangeToHabitTrack(tracks, change)).toEqual(result)
        })

        it('there is multiple tracks that does not overlap return a new track', () => {
            const tracks: HabitTrack[] = [{
                month: 5,
                year: 2023,
                days: new Array(32).fill(0)
            },
            {
                month: 6,
                year: 2023,
                days: new Array(32).fill(0)
            },
            {
                month: 5,
                year: 2022,
                days: new Array(32).fill(0)
            }]

            const change: HabitTrackChange = {
                habitId: '',
                month: 10,
                year: 2025,
                day: 10,
                increment: 5
            }
            const days = new Array(32).fill(0)
            days[change.day] = change.increment
            const result: HabitTrack = {
                month: change.month,
                year: change.year,
                days
            }

            expect(applyChangeToHabitTrack(tracks, change)).toEqual(result)
        })

        it('there is multiple tracks that overlap return a merged track', () => {
            const tracks: HabitTrack[] = [{
                month: 5,
                year: 2023,
                days: new Array(32).fill(0)
            },
            {
                month: 6,
                year: 2023,
                days: new Array(32).fill(0)
            },
            {
                month: 5,
                year: 2022,
                days: new Array(32).fill(0)
            }]
            tracks[1].days[3] = 4

            const change: HabitTrackChange = {
                habitId: '',
                month: 6,
                year: 2023,
                day: 3,
                increment: 2
            }
            const days = new Array(32).fill(0)
            days[change.day] = change.increment + tracks[1].days[3]
            const result: HabitTrack = {
                month: change.month,
                year: change.year,
                days
            }

            expect(applyChangeToHabitTrack(tracks, change)).toEqual(result)
        })
    })

    describe('getCompletionsInLastDays', () => {
        it('empty tracks return zero', () => {
            const tracks: HabitTrack[] = []
            const from = new Date()
            const ndays = 10

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(0)
        })

        it('ndays equal zero return zero', () => {
            const tracks: HabitTrack[] = [{
                month: 3,
                year: 2022,
                days: new Array(32).fill(1)
            },
            {
                month: 2,
                year: 2022,
                days: new Array(32).fill(2)
            },
            {
                month: 1,
                year: 2022,
                days: new Array(32).fill(3)
            }]
            const from = new Date(2022, 2, 5)
            const ndays = 0

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(0)
        })

        it('return the sum of last ndays', () => {
            const tracks: HabitTrack[] = [{
                month: 12,
                year: 2023,
                days: new Array(32).fill(1)
            }]
            const from = new Date(2023, 11, 20)
            const ndays = 10

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(10)
        })

        it('return the value from one day', () => {
            const tracks: HabitTrack[] = [{
                month: 10,
                year: 2024,
                days: new Array(32).fill(5)
            }]
            const from = new Date(2024, 9, 15)
            const ndays = 1

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(5)
        })

        it('return the sum of last ndays across multiple months', () => {
            const tracks: HabitTrack[] = [{
                month: 3,
                year: 2022,
                days: new Array(32).fill(1)//31
            },
            {
                month: 2,
                year: 2022,
                days: new Array(32).fill(2)//28
            },
            {
                month: 1,
                year: 2022,
                days: new Array(32).fill(3)//31
            }]
            const from = new Date(2022, 2, 5)
            const ndays = 50

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(5 + 28*2 + 17*3)
        })

        it('there is no relevant habit track return zero', () => {
            const tracks: HabitTrack[] = [{
                month: 10,
                year: 2024,
                days: new Array(32).fill(1)
            },
            {
                month: 9,
                year: 2023,
                days: new Array(32).fill(2)
            },
            {
                month: 8,
                year: 2022,
                days: new Array(32).fill(3)
            }]
            const from = new Date(2022, 6, 15)
            const ndays = 15

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(0)
        })

        it('habit tracks are too old return zero', () => {
            const tracks: HabitTrack[] = [{
                month: 8,
                year: 2024,
                days: new Array(32).fill(1)
            },
            {
                month: 7,
                year: 2024,
                days: new Array(32).fill(2)
            },
            {
                month: 6,
                year: 2024,
                days: new Array(32).fill(3)
            }]
            const from = new Date(2024, 8, 15)
            const ndays = 15

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(0)
        })

        it('only some habit tracks are relevant return only sum of relevant days', () => {
            const tracks: HabitTrack[] = [{
                month: 4,
                year: 2024,
                days: new Array(32).fill(4) //30
            },
            {
                month: 3,
                year: 2024,
                days: new Array(32).fill(1) //31
            },
            {
                month: 2,
                year: 2024,
                days: new Array(32).fill(2) //29
            },
            {
                month: 1,
                year: 2024,
                days: new Array(32).fill(3) //31
            }]
            const from = new Date(2024, 2, 1)
            const ndays = 30

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(1 + 29*2)
        })
    })

    describe('calculateCompletionPercentage', () => {
        it('reach target return 100', () => {
            const tracks: HabitTrack[] = [{
                month: 12,
                year: 2023,
                days: new Array(32).fill(1)
            }]
            const habit: Partial<Habit> = {
                target: 10,
                frequencyInDays: 10,
                habitTracks: tracks
            }
            const from = new Date(2023, 11, 20)

            expect(calculateCompletionPercentage(habit as Habit, from)).toEqual(100)
        })

        it('reach one third target return 33.333...', () => {
            const tracks: HabitTrack[] = [{
                month: 6,
                year: 2022,
                days: new Array(32).fill(1)
            }]
            const habit: Partial<Habit> = {
                target: 30,
                frequencyInDays: 10,
                habitTracks: tracks
            }
            const from = new Date(2022, 5, 20)

            expect(calculateCompletionPercentage(habit as Habit, from)).toEqual((10/30) * 100)
        })
        
        it('no progress done return zero', () => {
            const tracks: HabitTrack[] = [{
                month: 6,
                year: 2022,
                days: new Array(32).fill(0)
            }]
            const habit: Partial<Habit> = {
                target: 5,
                frequencyInDays: 1,
                habitTracks: tracks
            }
            const from = new Date(2022, 5, 20)

            expect(calculateCompletionPercentage(habit as Habit, from)).toEqual(0)
        })

        it('overdone progress return 200', () => {
            const tracks: HabitTrack[] = [{
                month: 6,
                year: 2022,
                days: new Array(32).fill(8)
            }]
            const habit: Partial<Habit> = {
                target: 4,
                frequencyInDays: 1,
                habitTracks: tracks
            }
            const from = new Date(2022, 5, 20)

            expect(calculateCompletionPercentage(habit as Habit, from)).toEqual(200)
        })
    })
})