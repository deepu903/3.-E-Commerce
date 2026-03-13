// Main user interface Complete user object with all properties
export interface User {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender?: 'male' | 'female' | 'other';
    image?: string;
    token: string;
    role?: 'admin' | 'user' | 'manager';
    permissions?: string[];
    phone?: string;
    address?: Address;
    createdAt?: Date;
    updatedAt?: Date;
}

//  Address interface Used within User interface
export interface Address {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
}

// Login Credentials Interface used for login form
export interface LoginCredentials {
    username: string;
    password: string;
    rememberMe?: boolean;
}

// Register Data Interface used for registration form
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    role?: 'admin' | 'user' | 'moderator';
    agreeToTerms: boolean;
}

// Auth Response Interface response from login/register API
export interface AuthResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: 'male' | 'female' | 'other';
    image: string;
    token: string;
    refreshToken: string;
}

// User profile update interface used for updating user profile
export interface UserProfileUpdate {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    image?: string;
    address?: Address;
}

// Password change interface used for changing password
export interface PasswordChange {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;

}

// user preferences interface store user settings and preferences
export interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    privacy: {
        profileVisible: boolean;
        showEmail: boolean;
        showPhone: boolean;
    };
}

// user stats interface user activity statistics
export interface UserStats {
    totalOrders: number;
    totalSpent: number;
    wishListItems: number;
    reviewsCount: number;
    memberSince: Date;
}

// Check if user has admin role
export function isAdmin(user: User | null): boolean {
    return user?.role === 'admin';
}

// Check if user has specific permission
export function hasPermission(user: User | null, permission: string): boolean {
    return user?.permissions?.includes(permission) ?? false;
}

// Get user full name
export function getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim();
}

// Get user initials for avatar
export function getUserInitials(user: User): string {
    const firstInitial = user.firstName?.charAt(0) || '';
    const lastInitial = user.lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
}