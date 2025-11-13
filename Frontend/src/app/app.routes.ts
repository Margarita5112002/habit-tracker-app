import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { habitResolver } from './core/resolvers/habit.resolver';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent),
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/home/dashboard/dashboard.component')
                    .then(c => c.DashboardComponent),
            },
            {
                path: 'create',
                loadComponent: () => import('./features/habits/components/create-habit-form/create-habit-form.component')
                    .then(c => c.CreateHabitFormComponent),
            },
            {
                path: 'habit/:id',
                loadComponent: () => import('./features/habits/components/habit-view/habit-view.component')
                    .then(c => c.HabitViewComponent),
                resolve: {
                    habitId: habitResolver
                }
            }
        ]
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component').then(c => c.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register.component').then(c => c.RegisterComponent)
    },
    {
        path: 'home',
        loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent),
        canActivate: [authGuard]
    }, 
    {
        path: '**',
        loadComponent: () => import('./features/errors/not-found/not-found.component').then(c => c.NotFoundComponent)
    }
];
