import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login.component').then(m => m.LoginComponent)
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register.component').then(m => m.RegisterComponent)
    },
    {
        path: '',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
    },
    {
        path: 'items',
        canActivate: [authGuard],
        loadComponent: () => import('./pages/items/items.component').then(m => m.ItemsComponent)
    },
    { path: '**', redirectTo: '' }
];
