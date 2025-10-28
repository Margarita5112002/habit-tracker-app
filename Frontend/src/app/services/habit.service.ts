import { inject, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, EMPTY, finalize, Subject, takeUntil, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class HabitService implements OnDestroy {
    readonly API_URL = `${environment.apiUrl}/habits`
    http = inject(HttpClient)
    destroy$ = new Subject<void>()
    habits = new BehaviorSubject<Habit[]>([])

    ngOnDestroy(): void {
        this.destroy$.next()
        this.destroy$.complete()
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
                console.log("new", data)
                const d = this.habits.value
                this.habits.next([...d, data])
            }),
            finalize(() => this.createLoading.next(false)),
            takeUntil(this.destroy$)
        )
    }
    

}

interface Habit {
    id: string,
    name: string,
    description: string | null,
    color: string,
    emoji: string,
    target: number,
    frequencyInDays: number,
    allowCustomValue: boolean,
    allowExceedTarget: boolean
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