import { inject, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, debounceTime, EMPTY, finalize, scan, Subject, takeUntil, tap } from "rxjs";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Habit } from "../models/habit";

@Injectable({
    providedIn: 'root'
})
export class HabitService implements OnDestroy {
    private readonly API_URL = `${environment.apiUrl}/habits`
    private readonly http = inject(HttpClient)
    private readonly destroy$ = new Subject<void>()
    private readonly habits = new BehaviorSubject<Habit[]>([])
    readonly habits$ = this.habits.asObservable()

    private readonly trackChanges = new Subject<HabitTrackChange | null>()


    constructor() {
        this.getAllHabits().subscribe()
        this.trackChanges.pipe(
            scan(
                (a, v) => v == null ? [] : this.appendHabitTrackChange(a, v),
                [] as HabitTrackChangeRequest[]
            ),
            debounceTime(1000),
            takeUntil(this.destroy$)
        ).subscribe((changes) => this.makeChangesRequests(changes))
    }

    private appendHabitTrackChange(acc: HabitTrackChangeRequest[], change: HabitTrackChange) {
        const request = acc.find(r => this.isTargetRequest(r, change))
        if (request) {
            const currIncrement = request.dayUpdates.get(change.day) ?? 0
            request.dayUpdates.set(change.day, currIncrement + change.increment)
            return acc.map(r => this.isTargetRequest(r, change) ? request : r)
        }
        const dayUpdates = new Map<number, number>()
        dayUpdates.set(change.day, change.increment)
        const newRequest: HabitTrackChangeRequest = {
            month: change.month,
            year: change.year,
            habitId: change.habitId,
            dayUpdates
        }
        return acc.concat(newRequest)
    }

    private isTargetRequest(r: HabitTrackChangeRequest, change: HabitTrackChange) {
        return r.habitId == change.habitId && r.month == change.month && r.year == change.year;
    }

    private makeChangesRequests(changes: HabitTrackChangeRequest[]) {
        if (changes.length == 0) return;
        this.trackChanges.next(null) // reset changes

        for (var change of changes) {
            const url = `${this.API_URL}/${change.habitId}/track/${change.year}/${change.month}/days/increment`

            const body = {
                dayUpdates: Object.fromEntries(change.dayUpdates)
            }
            this.http.patch(url, body).pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        console.log("success applying changes")
                    },
                    error: (err) => {
                        console.log("error applying change", err, change)
                    }
                })
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
        this.habits.complete()
        this.readLoading.complete()
        this.createLoading.complete()
        this.trackChanges.complete()
    }

    incrementTrack(change: HabitTrackChange) {
        const { year, month, day, increment, habitId } = change
        if (!this.isValidChange(change)) return 

        const currHabits = this.habits.value
        const habit = currHabits.find(h => h.id == habitId)
        if (habit == undefined) return

        const targetTrack = habit.habitTracks?.find(t => t.month == change.month && t.year == change.year)
        let newTrack = targetTrack
        if (targetTrack) {
            const newDays = [...targetTrack.days]
            newDays[day] += increment
            newTrack = { ...targetTrack, days: newDays }
        } else {
            const newDays: number[] = new Array(32).fill(0)
            newDays[day] = increment
            newTrack = {
                month: change.month,
                year: change.year,
                days: newDays
            }
        }

        const newHabit: Habit = {
            ...habit,
            habitTracks: habit.habitTracks
                ?.map(t => t.month == newTrack.month && t.year == newTrack.year ? newTrack : t)
        }
        const newHabits = currHabits.map(h => h.id == newHabit.id ? newHabit : h)
        this.habits.next(newHabits)

        this.trackChanges.next(change)
    }

    private isValidChange(change: HabitTrackChange) {
        return change.day >= 1 && change.day <= 31 
            && change.month > 0 && change.month <= 12 
            && change.year > 2020 && change.increment != 0
    }

    private readLoading = new BehaviorSubject(false)
    getReadLoadingObservable() {
        return this.readLoading.asObservable()
    }
    getAllHabits() {
        if (this.readLoading.value) return EMPTY

        this.readLoading.next(true)

        return this.http.get<Habit[]>(this.API_URL).pipe(
            tap((data) => {
                console.log("get all", data)
                const d = this.habits.value
                this.habits.next([...d, ...data])
            }),
            finalize(() => this.readLoading.next(false)),
            takeUntil(this.destroy$)
        )
    }

    private createLoading = new BehaviorSubject(false)
    getCreateLoadingObservable() {
        return this.createLoading.asObservable()
    }
    createHabit(request: CreateHabitRequest) {
        if (this.createLoading.value) return EMPTY

        this.createLoading.next(true)

        return this.http.post<Habit>(this.API_URL, request).pipe(
            tap((data) => {
                const d = this.habits.value
                this.habits.next([...d, data])
            }),
            finalize(() => this.createLoading.next(false)),
            takeUntil(this.destroy$)
        )
    }


}

interface HabitTrackChange {
    habitId: string,
    year: number,
    month: number,
    day: number,
    increment: number
}

interface HabitTrackChangeRequest {
    habitId: string,
    year: number,
    month: number,
    dayUpdates: Map<number, number>
}

interface CreateHabitRequest {
    name: string,
    description: string | null,
    color: string,
    emoji: string,
    target: number,
    frequencyInDays: number,
    allowCustomValue: boolean,
    allowExceedTarget: boolean
}