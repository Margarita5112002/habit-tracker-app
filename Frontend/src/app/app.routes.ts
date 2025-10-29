import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(c => c.HomeComponent),
        canActivate: [authGuard],
        children: [
            {
                path: 'create',
                loadComponent: () => import('./features/habits/create-habit-form/create-habit-form.component')
                    .then(c => c.CreateHabitFormComponent),
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
