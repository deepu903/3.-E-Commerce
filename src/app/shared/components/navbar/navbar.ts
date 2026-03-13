import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from '../../../core/services/auth/auth';
import { CartService } from '../../../core/services/cart/cart';

@Component({
  selector: 'app-navbar',
  imports: [MatToolbarModule, MatBadgeModule, MatButtonModule, MatMenuModule, MatIconModule, MatDividerModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
 private authService = inject(AuthService);
 private cartService = inject(CartService);
 private router = inject(Router);

 isMobileMenuOpen = false;

 // Check if user is authenticated
 isAuthenticated = this.authService.isAuthenticated;

 // Get current user's full name
 userName = this.authService.userFullName;

 //Get cart item count
 cartItemCount = this.cartService.itemCount;

 // Get user initials for avatar
 getUserInitials(): string {
  const user = this.authService.currentUser();
  if(!user) return 'G';

  const firstInitial = user.firstName?.charAt(0) || '';
  const lastInitial = user.lastName?.charAt(0) || '';

  return `${firstInitial}${lastInitial}`.toUpperCase() || 'U';
 }

 // Logout user
 logout(): void {
  this.authService.logout();
 }

 // Toggle Mobile menu
 toggleMobileMenu(): void {
  this.isMobileMenuOpen = !this.isMobileMenuOpen;
 }

 // Close mobile menu
 closeMobileMenu(): void {
  this.isMobileMenuOpen = false;
 }
}
