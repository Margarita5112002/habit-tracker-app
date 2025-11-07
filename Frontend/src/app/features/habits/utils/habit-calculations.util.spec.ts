import { HabitTrackChange } from "../models/habit-track-change.model"
import { HabitTrack } from "../models/habit-track.model"
import { Habit } from "../models/habit.model"
import { applyChangeToHabitTrack, calculateCompletionPercentage, getCompletionsInLastDays, getLastDays } from "./habit-calculations.util"

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

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(5 + 28 * 2 + 17 * 3)
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

            expect(getCompletionsInLastDays(tracks, from, ndays)).toEqual(1 + 29 * 2)
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

            expect(calculateCompletionPercentage(habit as Habit, from)).toEqual((10 / 30) * 100)
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

    describe('getLastDays', () => {
        it('ndays equal zero return empty days', () => {
            const tracks: HabitTrack[] = [{
                month: 4,
                year: 2024,
                days: new Array(32).fill(4) //30
            }]
            const ndays = 0
            const from = new Date(2024, 3, 10)

            expect(getLastDays(tracks, from, ndays)).toEqual([])
        })

        it('tracks is empty return ndays zeros', () => {
            const tracks: HabitTrack[] = []
            const ndays = 10
            const from = new Date(2024, 3, 10)

            const result = new Array(ndays).fill(0)

            expect(getLastDays(tracks, from, ndays)).toEqual(result)
        })

        it('return last ndays from tracks', () => {
            const tracks: HabitTrack[] = [{
                month: 5,
                year: 2024,
                days: new Array(32).fill(2)
            }]
            const ndays = 6
            const from = new Date(2024, 4, 18)

            const result = new Array(ndays).fill(2)

            expect(getLastDays(tracks, from, ndays)).toEqual(result)
        })

        it('return last ndays from tracks across multiple habit tracks', () => {
             const tracks: HabitTrack[] = [{
                month: 3,
                year: 2024,
                days: new Array(32).fill(2)
            },
            {
                month: 2,
                year: 2024,
                days: new Array(32).fill(3) //29
            },
            {
                month: 1,
                year: 2024,
                days: new Array(32).fill(1)
            }]
            const ndays = 40
            const from = new Date(2024, 2, 3)

            const part1 = new Array(3).fill(2)
            const part2 = new Array(29).fill(3)
            const part3 = new Array(8).fill(1)
            const result = [...part1, ...part2, ...part3]

            expect(getLastDays(tracks, from, ndays)).toEqual(result)
        })

        it('return last ndays from tracks and fill gaps', () => {
            const tracks: HabitTrack[] = [{
                month: 3,
                year: 2022,
                days: new Array(32).fill(3)
            },
            {
                month: 1,
                year: 2022,
                days: new Array(32).fill(1)
            }]
            const ndays = 40
            const from = new Date(2022, 2, 7)

            const part1 = new Array(7).fill(3)
            const part2 = new Array(28).fill(0)
            const part3 = new Array(5).fill(1)
            const result = [...part1, ...part2, ...part3]

            expect(getLastDays(tracks, from, ndays)).toEqual(result)
        })

        it('return last ndays from tracks and fill gaps at start', () => {
            const tracks: HabitTrack[] = [{
                month: 6,
                year: 2024,
                days: new Array(32).fill(2)
            }]
            const ndays = 10
            const from = new Date(2024, 6, 7)

            const part1 = new Array(7).fill(0)
            const part2 = new Array(3).fill(2)
            const result = [...part1, ...part2]

            expect(getLastDays(tracks, from, ndays)).toEqual(result)
        })

        it('return last ndays from tracks and fill gaps at end', () => {
            const tracks: HabitTrack[] = [{
                month: 9,
                year: 2020,
                days: new Array(32).fill(1)
            }]
            const ndays = 7
            const from = new Date(2020, 8, 4)

            const part1 = new Array(4).fill(1)
            const part2 = new Array(3).fill(0)
            const result = [...part1, ...part2]

            expect(getLastDays(tracks, from, ndays)).toEqual(result)
        })

        it('return ndays zeros if no tracks are relevant', () => {
            const tracks: HabitTrack[] = [{
                month: 11,
                year: 2025,
                days: new Array(32).fill(3)
            }]
            const ndays = 14
            const from = new Date(2025, 9, 5)

            const result = new Array(ndays).fill(0)

            expect(getLastDays(tracks, from, ndays)).toEqual(result)
        })
    })
})