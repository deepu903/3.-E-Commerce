import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full' // Match exact path only
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
        canActivate: [guestGuard],
        title: 'Login - E-Shop',
        data: { animation: 'loginPage'}
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register),
        canActivate: [guestGuard],
        title: 'Register - E-Shop',
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
        canActivate: [authGuard],
        title: 'Dashboard - E-Shop'
    },
    {
        path: 'products',
        canActivate: [authGuard],
        children: [
            {
                path: '',
                loadComponent: () => import('./features/products/product-list/product-list').then(m => m.ProductList),
                title: 'Products - E-Shop'
            },
            {
                path: 'new',
                loadComponent: () => import('./features/products/product-form/product-form').then(m => m.ProductForm),
                title: 'Add Product - E-Shop'
            },
            {
                path: ':id',
                loadComponent: () => import('./features/products/product-detail/product-detail').then(m => m.ProductDetail),
                title: 'Product Detail - E-Shop'
            },
            {
                path: ':id/edit',
                loadComponent: () => import('./features/products/product-form/product-form').then(m => m.ProductForm),
                title: 'Edit Product - E-Shop'
            }
        ]
    },
    {
        path: 'cart',
        loadComponent: () => import('./features/cart/cart').then(m => m.Cart),
        canActivate: [authGuard],
        title: 'Shopping Cart - E-Shop'
    },
    {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
        canActivate: [authGuard],
        title: 'Profile - E-Shop'
    },
    {
        path: '**',
        redirectTo: '/login',
        pathMatch: 'full'
    }
];
