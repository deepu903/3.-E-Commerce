import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { StateService } from '../../services/state/state';
import { catchError, retry, throwError, timer } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  // Inject Services
  const router = inject (Router);
  const stateService = inject(StateService);
  const platformId = inject(PLATFORM_ID);

  /**
   * PASS REQUEST TO NEXT HANDLER & CATCH ERRORS
   * Use RxJS pipe() to chain multiple operators:
   * 1. retry() - Retry failed requests
   * 2. catchError() - Handle errors
   */
  return next(req).pipe(
    // Automatically retry failed requests useful for temporary network issues
    retry({
      count: 2, // retry 2 times
      delay: (error, retryCount) => {
        // Only retry on network errors or 5xx server errors
        if(error.status >= 500 || error.status === 0) {
          console.log(`🔄️ Retry attempt ${retryCount} for ${req.url}`);
          // Exponential backoff: 1s, 2s, 4s...
          return timer(Math.pow(2, retryCount) * 1000);
        }
        // Don't retry on client errors (4xx);
        return throwError(() => error);
      }
    }),
    // Catch & handle errors: catchError() is called when request fails
    catchError((error: HttpErrorResponse) => {
      // Always hide loading indicator on error
      stateService.hideLoader();

      // Initialize error message
      let errorMessage = 'An unexpected error occurred';
      let errorTitle = 'Error';

      /** 
       * HANDLE CLIENT-SIDE ERRORS
       * These are errors that occur in the browser: 1. Network issues, 2. CORS errors, 3. Javascript errors
       */
      if(error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network Error: ${error.error.message}`;
        errorTitle = 'Network Error';

        console.error('❌ Client side error:', {
          message: error.error.message,
          url: req.url,
          method: req.method
        });
      }
      /**
       * HANDLE SERVER-SIDE ERRORS
       * These are HTTP error responses from the server
       */
      else {
        // Server-side error- Handle different status codes
        switch (error.status) {
          // 400 Bad request: Invalid request data sent to server
          case 400:
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
            errorTitle = 'Bad Request';
            break;

          // 401 Unauthorized: User is not authenticated or token expiry
          case 401:
            errorMessage = 'Your session has expired. Please login again.';
            errorTitle = 'Unauthorized';

            // Clear auth data
            if (isPlatformBrowser(platformId)) {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }

            // Redirect to login 
            router.navigate(['/login'], {
              queryParams: {
                returnUrl: router.url,
                reason: 'session_expired'
              }
            });
            break;
          
          // 403 Forbidden: User authenticated but doesn't have permission
          case 403:
            errorMessage = 'You don\'t have permission to access this resource.';
            errorTitle = 'Access denied';
            break;

          // 404 Not Found: Resource doesn't exist
          case 404:
            errorMessage = error.error?.message || 'The requested resource was not found.';
            errorTitle = 'Not Found';
            break;

          // 408 Request Timeout: Request took too long
          case 408:
            errorMessage = 'Request timeout. Please try again.';
            errorTitle = 'Timeout';
            break;
          
          // 409 Conflict: Resource conflict (e.g. duplicate email)
          case 409:
            errorMessage = error.error?.message || 'A conflict occured. Resources already exists.';
            errorTitle = 'Conflict';
            break;
            
          // 422 Unprocessable Entity: Validation errors
          case 422:
            errorMessage = error.error?.message || 'Validation failed. Please check your input.';
            errorTitle = 'Validation Error';
            break;

          // 429 Too Many Requests: Rate limit exceeded
          case 429:
            errorMessage = 'Too many requests. Please wait and try again.';
            errorTitle = 'Rate time Exceeded';
            break;
          
          // 500 Internal Server Error: Server crashed or error in server code
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            errorTitle = 'Server Error';
            break;
            
          // 502 Bad Gateway: Server is down or unreachable
          case 502:
            errorMessage = 'Server is temporarily unavailable.';
            errorTitle = 'Bad Gateway';
            break;
            

          // 503 Service Unavailable: Server is overloaded or under maintenance
          case 503:
            errorMessage = 'Server is temporarily unavailable. Maintenance is progress.';
            errorTitle = 'Service Unavailable';
            break;

          // 504 Gateway Timeout: Server didn't respond in time
          case 504:
            errorMessage = 'Server timeout. Please try again.';
            errorTitle = 'Gateway Timeout';
            break;
          
          // 0 - Network Error: No internet connection
          case 0:
            errorMessage = 'Network error. Please check your internet connection.';
            errorTitle = 'Network Error';
            break;

          // Default error: Unknown error
          default:
            errorMessage = error.error?.message || `Error: ${error.status} - ${error.statusText}`;
            errorTitle = 'Error';          
        }
        
        // Log detailed error info for debugging
        console.error('❌ HTTP Error:', {
          status: error.status,
          statusText: error.statusText,
          message: errorMessage,
          url: req.url,
          method: req.method,
          error: error.error
        });
      }

      // Show error notification to user
      stateService.addNotification('error', `${errorTitle}: ${errorMessage}`);

      //Throw error to be caught by calling component
      // Components can still handle specific errors if needed
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        title: errorTitle,
        originalError: error
      }));
    })
  );
};
