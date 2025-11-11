import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router, RouterStateSnapshot } from "@angular/router";
import { Habit } from "../../features/habits/models/habit.model";
import { inject } from "@angular/core";
import { HabitService } from "../../features/habits/services/habit.service";
import { map } from "rxjs";

export const habitResolver: ResolveFn<Habit> = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const habitService = inject(HabitService);
  const router = inject(Router);
  const habitId = route.paramMap.get('id')!;
  return habitService.getHabitById(habitId).pipe(
    map(habit => {
        if(habit == null) 
            return new RedirectCommand(router.parseUrl('/404'));
        return habit
    })
  )
};