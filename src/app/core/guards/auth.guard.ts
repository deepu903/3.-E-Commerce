import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth/auth';

/**
 * ────────────────────────────────────────────────────────
 * Guest Guard - Allows access only to unauthenticated users
 * ────────────────────────────────────────────────────────
 * Use this guard on routes like login, register, forgot-password
 * If user is already logged in, redirect them to home/dashboard
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    // User is logged in, redirect to home
    console.log('🚫 Already authenticated - Redirecting to home');
    router.navigate(['/dashboard']);
    return false;
  }

  // User is not logged in, allow access to guest pages
  console.log('✅ Guest access granted');
  return true;
};

/**
 * ────────────────────────────────────────────────────────
 * Auth Guard - Allows access only to authenticated users
 * ────────────────────────────────────────────────────────
 * Use this guard on protected routes like profile, orders, etc.
 * If user is not logged in, redirect them to login page
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    // User is not logged in, redirect to login
    console.log('🚫 Not authenticated - Redirecting to login');
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // User is logged in, allow access
  console.log('✅ Auth guard passed');
  return true;
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  
  // We need AuthService to get the authentication token
  const authService = inject(AuthService);

  // Get authentication token from AuthService
  const token = authService.getToken();

  // Check if request needs authentication 
  /**
   * Skip adding token for:
   * - Login endpoint (user doesn't have token yet)
   * - Register endpoint (new user signup)
   * - Public endpoints (no auth required)
   */
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('auth/register');
  
  // If it's an auth endpoint, pass request as-is
  if(isAuthEndpoint) {
    console.log('🔓 Public endpoint - No token needed:', req.url);
    return next(req);
  }

   /**
   * ────────────────────────────────────────────────────────
   * STEP 4: Clone request and add Authorization header
   * ────────────────────────────────────────────────────────
   * IMPORTANT: HTTP requests are immutable in Angular.
   * We cannot modify original request directly.
   * We must CLONE the request and add headers to the clone.
   */
  if(token) {
    // clone request with added headers
    const clonedRequest = req.clone({
      setHeaders: {
        // Add Authorization header with Bearer token
        Authorization: `Bearer ${token}`,

        // Add Content-Type if not already present
        'Content-Type': req.headers.has('Content-type') ? req.headers.get('Content-Type')! : 'application/json',

        // Add custom header (optional)
        'X-App-Version': '1.0.0',

        // Add timestamp (optional - for debugging)
        'X-Request-Time': new Date().toISOString()
      }
    });
    console.log('🔐 Token added to request:', req.url);
    console.log('📤 Headers:', {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });

    /**
     * ──────────────────────────────────────────────────────
     * STEP 5: Pass cloned request to next handler
     * ──────────────────────────────────────────────────────
     * This sends the modified request to the server
     */
    return next(clonedRequest);
  }

  /**
   * ────────────────────────────────────────────────────────
   * STEP 6: No token available
   * ────────────────────────────────────────────────────────
   * If user is not logged in, send request without token
   * Some endpoints might be accessible without auth
   */
  console.log('⚠️ No token availabel - Sending request without auth');
  return next(req);
};
