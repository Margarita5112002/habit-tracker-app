import { inject, Injectable, OnDestroy } from "@angular/core"
import { catchError, debounceTime, EMPTY, finalize, Observable, of, scan, Subject, takeUntil, tap, throwError } from "rxjs"
import { Habit } from "../models/habit.model"
import { HabitApiService } from "./habit-api.service"
import { HabitStateService } from "./habit-state.service"
import { CreateHabitRequest, HabitTrackChangeRequest } from "../models/habit-dtos.model"
import { HabitTrackChange } from "../models/habit-track-change.model"
import { applyChangeToHabitTrack } from "../utils/habit-calculations.util"
import { isValidTrackChange } from "../utils/habit-validators.utils"
import { HttpErrorResponse } from "@angular/common/http"

@Injectable({
    providedIn: 'root'
})
export class HabitService implements OnDestroy {
    private readonly api = inject(HabitApiService)
    private readonly state = inject(HabitStateService)
    private readonly destroy$ = new Subject<void>()
    private readonly trackChanges$ = new Subject<HabitTrackChange | null>()

    readonly habits = this.state.habits
    readonly loading = this.state.loading
    readonly error = this.state.error

    private isInitialized = false

    constructor() {
        this.initializeTrackChangeHandler()
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
    }

    private initializeTrackChangeHandler(): void {
        this.trackChanges$.pipe(
            scan(
                (acc, value) => value === null 
                    ? [] 
                    : this.aggregateTrackChange(acc, value),
                [] as HabitTrackChangeRequest[]
            ),
            debounceTime(1000),
            takeUntil(this.destroy$)
        ).subscribe(changes => this.syncTrackChanges(changes))
    }

    private aggregateTrackChange(
        acc: HabitTrackChangeRequest[],
        change: HabitTrackChange
    ): HabitTrackChangeRequest[] {
        const existingIndex = acc.findIndex(r =>
            r.habitId === change.habitId &&
            r.month === change.month &&
            r.year === change.year
        )

        if (existingIndex !== -1) {
            const existing = acc[existingIndex]
            const currentValue = existing.dayUpdates[change.day] ?? 0
            existing.dayUpdates[change.day] = currentValue + change.increment
            return acc
        }

        return [...acc, {
            habitId: change.habitId,
            year: change.year,
            month: change.month,
            dayUpdates: { [change.day]: change.increment }
        }]
    }

    private syncTrackChanges(changes: HabitTrackChangeRequest[]): void {
        if (changes.length === 0) return

        this.trackChanges$.next(null) // Reset

        changes.forEach(change => {
            this.api.incrementTrack(change).pipe(
                catchError(error => {
                    console.error('Failed to sync track changes:', error)
                    // TODO: Implement rollback or retry logic
                    return of(null)
                }),
                takeUntil(this.destroy$)
            ).subscribe()
        })
    }

    initializeHabits() {
        if (this.isInitialized) return EMPTY
        return this.loadHabits()
    }

    loadHabits(): Observable<Habit[]> {
        if (this.state.loading().read) return of(this.state.habits())

        this.state.setLoading('read', true)
        this.state.setError(null)

        return this.api.getAllHabits().pipe(
            tap(habits => this.state.setHabits(habits)),
            catchError(error => {
                this.state.setError('Failed to load habits')
                console.error('Error loading habits:', error)
                return of([])
            }),
            finalize(() => this.state.setLoading('read', false)),
            takeUntil(this.destroy$)
        )
    }

    incrementTrack(change: HabitTrackChange): void {
        if (!isValidTrackChange(change)) return
        const habit = this.state.getHabitById(change.habitId)
        if (!habit) return

        // Optimistic update
        const updatedTrack = applyChangeToHabitTrack(habit.habitTracks, change)
        this.state.updateHabitTrack(habit.id, updatedTrack)

        // Queue for sync
        this.trackChanges$.next(change)
    }

    createHabit(request: CreateHabitRequest) {
        if (this.state.loading().create) return EMPTY

        this.state.setLoading('create', true)
        this.state.setError(null)

        return this.api.createHabit(request).pipe(
            tap(habit => this.state.addHabit(habit)),
            catchError(error => {
                this.state.setError('Failed to create habit')
                console.error('Error creating habit:', error)
                return of(null)
            }),
            finalize(() => this.state.setLoading('create', false)),
            takeUntil(this.destroy$)
        )
    }

    getHabitById(id: string, useCache = true): Observable<Habit | null> {
        if (useCache) {
            const habit = this.state.getHabitById(id)
            if (habit) return of(habit)
        }

        if (this.state.loading().read) EMPTY

        this.state.setLoading('read', true)
        this.state.setError(null)

        return this.api.getHabitById(id).pipe(
            catchError(err => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status == 404) return of(null)
                }
                return throwError(() => err)
            }),
            finalize(() => this.state.setLoading('read', false)),
            takeUntil(this.destroy$)
        )
    }

}
