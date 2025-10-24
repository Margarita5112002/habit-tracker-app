import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class HabitService {
    habits = new BehaviorSubject()


}

interface Habit {
    id: string,
    name: string,
    description: string | null,
    color: string,
    emoji: string,
    target: int
}