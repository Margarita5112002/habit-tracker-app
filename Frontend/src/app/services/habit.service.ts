import { inject, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, EMPTY, finalize, Subject, takeUntil, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Habit } from "../shared/models/habit";

@Injectable({
    providedIn: 'root'
})
export class HabitService implements OnDestroy {
    private readonly API_URL = `${environment.apiUrl}/habits`
    private readonly http = inject(HttpClient)
    private readonly destroy$ = new Subject<void>()
    private readonly habits = new BehaviorSubject<Habit[]>([])
    readonly habits$ = this.habits.asObservable()

    constructor() {
        this.getAllHabits().subscribe()
    }

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
        this.habits.complete()
        this.readLoading.complete()
        this.createLoading.complete()
    }

    private readLoading = new BehaviorSubject(false)
    getReadLoadingObservable() {
        return this.readLoading.asObservable()
    }
    getAllHabits() {
        if(this.readLoading.value) return EMPTY

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