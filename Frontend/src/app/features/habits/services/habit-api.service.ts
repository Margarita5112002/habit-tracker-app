import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Habit } from "../models/habit.model";
import { CreateHabitRequest, HabitTrackChangeRequest, UpdateHabitRequest } from "../models/habit-dtos.model";

@Injectable({
    providedIn: 'root'
})
export class HabitApiService {
    private readonly baseUrl = `${environment.apiUrl}/habits`
    private readonly http = inject(HttpClient)

    getAllHabits(): Observable<Habit[]> {
        return this.http.get<Habit[]>(this.baseUrl);
    }

    getHabitById(id: string): Observable<Habit> {
        return this.http.get<Habit>(`${this.baseUrl}/${id}`)
    }

    createHabit(request: CreateHabitRequest): Observable<Habit> {
        return this.http.post<Habit>(this.baseUrl, request);
    }

    updateHabit(id: string, request: UpdateHabitRequest) {
        return this.http.put(`${this.baseUrl}/${id}`, request)
    }

    deleteHabit(id: string) {
        return this.http.delete(`${this.baseUrl}/${id}`)
    }

    incrementTrack(change: HabitTrackChangeRequest): Observable<void> {
        const { habitId, year, month, dayUpdates } = change
        const url = `${this.baseUrl}/${habitId}/track/${year}/${month}/days/increment`;
        return this.http.patch<void>(url, { dayUpdates });
    }
}