import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../api/api';
import { BehaviorSubject, Observable, tap, catchError } from 'rxjs';
import { LoginCredentials, RegisterData, User } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //Inject dependencies
  private router = inject(Router);
  private apiService = inject(ApiService);
  private platformId = inject(PLATFORM_ID);
  
  // ═══════════════════════════════════════════════════════════
  // RXJS - BehaviorSubject (Traditional approach)
  // ═══════════════════════════════════════════════════════════

  private userSubject = new BehaviorSubject<User | null>(null);

  //Observable stream for component to subscribe
  user$ = this.userSubject.asObservable();

  // ═══════════════════════════════════════════════════════════
  // SIGNALS - New Angular Reactivity System
  // ═══════════════════════════════════════════════════════════

  // Writable Signal - Can be updated directly
  currentUser = signal<User | null>(null);

  // Computed Signal - Automatically updates when currentUser changes
  isAuthenticated = computed(() => this.currentUser() !== null);

  // Computed Signal - Get user role
  userRole = computed(() => {
    const user = this.currentUser();
    return user?.role || 'guest';
  });

  // Computed Signal - Get user full name
  userFullName = computed(() => {
    const user = this.currentUser();
    if(!user) return 'guest';
    return `${user.firstName} ${user.lastName}`.trim()
  });

  // Track login time
  lastLoginTime = signal<string | null>(null);

  // Computedd Signal - Check if user is Admin
  isAdmin = computed(() => {
    const user = this.currentUser();
    return user?.role === 'admin';
  });

  // ═══════════════════════════════════════════════════════════
  // CONSTRUCTOR - Initialize service
  // ═══════════════════════════════════════════════════════════

  constructor() {
    this.initializeAuth()
  }

  // ═══════════════════════════════════════════════════════════
  // AUTHENTICATION METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * Initialize authentication state from local storage
   */
  private initializeAuth(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if(token && userData) {
      try {
        const user = JSON.parse(userData);

        // Update both signal and BehaviorSubject
        this.currentUser.set(user);
        this.userSubject.next(user);

        // Restore login time
        const loginTime = localStorage.getItem('lastLoginTime');
        if (loginTime) {
          this.lastLoginTime.set(loginTime);
        }

        console.log('✅ User session restored:', user.username);
      } catch (error) {
        console.error('❌ Failed to restore session:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Login user
   * @param username - Username
   * @param password - Password
   */
  login(username: string, password: string): Observable<any> {
    const credentials: LoginCredentials = { 
      username: username.trim(), 
      password: password.trim() 
    };
    console.log('📤 Logging in with:', JSON.stringify(credentials));
    
    return this.apiService.login(credentials).pipe(
      tap(response => {
        // Success from real API
        this.handleSuccessfulLogin(response);
      }),
      // MOCK IMPLEMENTATION: Fallback for newly registered users that don't exist in DummyJSON
      catchError((error: any) => {
        // Since api.ts handleError converts HTTP errors to native Error objects with message "Server Error: 400..."
        const is400Error = error instanceof Error && error.message.includes('400');
        
        if (is400Error && isPlatformBrowser(this.platformId)) {
          console.log('🔄 API Login failed (400). Checking local mock_users...');
          // Check local mock users
          const mockUsersJson = localStorage.getItem('mock_users');
          if (mockUsersJson) {
            const mockUsers = JSON.parse(mockUsersJson);
            console.log(`🔍 Found ${mockUsers.length} mock users in localStorage.`);
            
            // Log what we are looking for vs what we have
            const searchUsername = credentials.username.toLowerCase().trim();
            console.log(`🔎 Looking for username: "${searchUsername}"`);
            
            const user = mockUsers.find((u: any) => {
              const uUsername = (u.username || '').toLowerCase().trim();
              const uPassword = u.password;
              
              const isMatch = uUsername === searchUsername && uPassword === credentials.password;
              
              if (isMatch) {
                console.log('✅ Found matching user:', u.username);
              }
              return isMatch;
            });
            
            if (user) {
              console.log('✅ Mock Login successful:', user.username);
              // Create a mock token array to simulate response
              const mockResponse = { 
                ...user, 
                token: 'mock-jwt-token-' + Date.now(),
                // Ensure some critical fields exist if they were missing from the API response
                firstName: user.firstName || user.username,
                lastName: user.lastName || '',
                role: user.role || 'user'
              };
              
              // Handle success
              this.handleSuccessfulLogin(mockResponse);
              
              // Return mock response as Observable
              return new Observable(subscriber => {
                subscriber.next(mockResponse);
                subscriber.complete();
              });
            } else {
              console.log('❌ User not found in mock_users or wrong password');
              console.log('📋 Available mock users:', mockUsers.map((u: any) => ({ 
                username: u.username, 
                // Don't log passwords in production, but for local mock debugging it's helpful
                password: '***' 
              })));
            }
          } else {
            console.log('❌ No mock_users found in localStorage');
          }
        }
        // If not a 400 error or not found in mock users, rethrow
        throw error;
      })
    );
  }

  // Helper method to keep login logic DRY
  private handleSuccessfulLogin(response: any): void {
    const loginTime = new Date().toISOString();
    
    if (isPlatformBrowser(this.platformId)) {
      // Store token and user data in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response));
      localStorage.setItem('lastLoginTime', loginTime);
    }
    
    // Update Signals
    this.currentUser.set(response);
    this.lastLoginTime.set(loginTime);
    
    // Update BehaviorSubject
    this.userSubject.next(response);
    
    // Navigate to dashboard
    this.router.navigate(['/dashboard']);
  }

  /**
   * Register new user
   * @param data - Registration data
   */
  register(data: RegisterData): Observable<any> {
    return this.apiService.register(data).pipe(
      tap(response => {
        console.log('✅ Registration successful API mock:', response.username);
        
        // MOCK IMPLEMENTATION: Store user in localStorage so they can login later
        if (isPlatformBrowser(this.platformId)) {
          const mockUsersJson = localStorage.getItem('mock_users');
          const mockUsers = mockUsersJson ? JSON.parse(mockUsersJson) : [];
          
          // Create a mock user object with the password (only for local testing!)
          const newUser = {
            ...data, // Use original registration data
            ...response, // Add data from API response (like id)
            password: data.password // Ensure password is saved for login verification
          };

          // Remove existing user with same username to avoid duplicates
          const filteredUsers = mockUsers.filter((u: any) => 
            u.username.toLowerCase().trim() !== newUser.username.toLowerCase().trim()
          );
          
          filteredUsers.push(newUser);
          localStorage.setItem('mock_users', JSON.stringify(filteredUsers));
          console.log('💾 User saved locally for mock login:', newUser.username);
        }

        // Navigate to login page
        this.router.navigate(['/login']);
      })
    );
  }

  /**
   * Logout user
   */
  logout():void {
    if (isPlatformBrowser(this.platformId)) {
      // CLear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Reset Signal
    this.currentUser.set(null);

    // Reset BehaviourSubject
    this.userSubject.next(null);
    console.log('✅ Logout successful');

    // Navigate to login page
    this.router.navigate(['/login']);
  } 

  /**
   * Clear authentication data
   */
  private clearAuth(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('lastLoginTime');
    }
    this.currentUser.set(null);
    this.lastLoginTime.set(null);
    this.userSubject.next(null);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('token');
  }

  /**
   * Check if user has valid token
   */
  hasValidToken(): boolean{
    return !!this.getToken();
  }

  /**
   * Check if token is expired (mock implementation)
   */
  isTokenExpired(): boolean {
    // in real app, decode JWT and check expiry
    return !this.hasValidToken();
  }

  /**
   * Check if user has specific permission
   * @param permission - Permission to check
   */
  hasPermission(permission: string ): boolean {
    const user = this.currentUser();
    if(!user) return false;

    // Admin has all permissions
    if(user.role === 'admin') return true;

    // Check user permissions array
    return user.permissions?.includes(permission) ?? false;
  }

  /**
   * Check if user has specific role
   * @param role - Role to check
   */
  hasRole(role: string): boolean {
    const user =  this.currentUser();
    return user?.role === role;
  }

  /**
   * Check if user can edit resources
   */
  canEdit(): boolean {
    return this.hasRole('admin') || this.hasRole('manager');
  }

  /**
   * Check if user can delete resources
   */
  canDelete(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Update user profile in state
   * @param updates - Partial user data to update
   */
  updateProfile(updates: Partial<User>): void {
    const currentUserData = this.currentUser();
    if(!currentUserData) return;

    const updatedUser = {...currentUserData, ...updates};
    
    // Update Signal
    this.currentUser.set(updatedUser);

    // Update BehaviorSubject
    this.userSubject.next(updatedUser);

    //Update localStorage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Also update in mock_users if it exists there
      const mockUsersJson = localStorage.getItem('mock_users');
      if (mockUsersJson) {
        const mockUsers = JSON.parse(mockUsersJson);
        const index = mockUsers.findIndex((u: any) => u.username === updatedUser.username);
        if (index !== -1) {
          mockUsers[index] = { ...mockUsers[index], ...updates };
          localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        }
      }
    }

    console.log('✅ Profile update successful');
  }

  /**
   * Mock Change Password
   */
  changePassword(newPassword: string): void {
    const user = this.currentUser();
    if (!user) return;

    if (isPlatformBrowser(this.platformId)) {
      // Update in mock_users
      const mockUsersJson = localStorage.getItem('mock_users');
      if (mockUsersJson) {
        const mockUsers = JSON.parse(mockUsersJson);
        const index = mockUsers.findIndex((u: any) => u.username === user.username);
        if (index !== -1) {
          mockUsers[index].password = newPassword;
          localStorage.setItem('mock_users', JSON.stringify(mockUsers));
          console.log('✅ Password updated in mock storage');
        }
      }
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId(): number | null {
    return this.currentUser()?.id || null;
  }

  /**
   * Get current username
   */
  getCurrentUsername(): string {
    return this.currentUser()?.username || 'Guest';
  }
}
