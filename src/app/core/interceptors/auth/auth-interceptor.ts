import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // STEP 1 : Inject AuthService to get the authentication token
  const authService = inject(AuthService);

  // STEP 2 : Get authentication token from authService
  const token = authService.getToken();
  
  // STEP 3 : Check if request needs endpoint
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');

  // if it's an auth endpoint, pass request as-is
  if(isAuthEndpoint) {
    console.log('🔓 Public endpoint - No token needed:', req.url);
    return next(req);
  }

  // STEP 4 : Clone request and add Authorization header
  if(token) {
    // Clone request with added headers
    const cloneRequested = req.clone({
      setHeaders: {
        // Add Authorization header with Bearer token
        Authorization: `Bearer ${token}`,

        // Add Content-type if not already present
        'Content-Type' : req.headers.has('Content-Type') ? req.headers.get('Content-Type')! : 'application/json',
        
        // Add custom header (optional)
        'X-App-Version': '1.0.0',

        //Add timestamp (optional - for debugging)
        'X-Request-Time': new Date().toISOString()
      }
    });

    console.log('🔐 Token added to request:', req.url);
    console.log('📤 Headers:', {
      Authorization: `Bearer ${token.substring(0, 20)}...`,
      'Content-Type': 'application/json'
    });

    // STEP 5 : Pass the cloned request to the next interceptor or backend
    return next(cloneRequested);
  }

  // STEP 6: No Token Available
  console.log('⚠️ No token available -Sending request without auth');
  return next(req);
};
