import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth/auth';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StateService } from '../../core/services/state/state';

@Component({
  selector: 'app-profile',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatTabsModule, CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  private authService = inject(AuthService);
  private stateService = inject(StateService);

  currentUser = this.authService.currentUser;
  userName = this.authService.userFullName;
  userRole = this.authService.userRole;
  lastLoginTime = this.authService.lastLoginTime;

  isEditing = false;
  isChangingPassword = false;

  editData = {
    firstName: '',
    lastName: '',
    email: ''
  };

  passwordData = {
    newPassword: '',
    confirmPassword: ''
  };

  userEmail() {
    return this.currentUser()?.email || '';
  }

  getUserInitials(): string {
    const user = this.currentUser();
    if ( !user ) return '';
    return `${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`.toUpperCase();
   }

   onLogout(): void {
     this.authService.logout();
     this.stateService.addNotification('success', 'Logged out successfully');
   }

   toggleEdit(): void {
     this.isEditing = !this.isEditing;
     if (this.isEditing) {
       const user = this.currentUser();
       if (user) {
         this.editData = {
           firstName: user.firstName || '',
           lastName: user.lastName || '',
           email: user.email || ''
         };
       }
     }
   }

   saveProfile(): void {
     this.authService.updateProfile(this.editData);
     this.isEditing = false;
     this.stateService.addNotification('success', 'Profile updated successfully');
   }

   togglePasswordChange(): void {
     this.isChangingPassword = !this.isChangingPassword;
     this.passwordData = { newPassword: '', confirmPassword: '' };
   }

   updatePassword(): void {
     if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
       this.stateService.addNotification('error', 'Passwords do not match');
       return;
     }
     
     if (this.passwordData.newPassword.length < 6) {
       this.stateService.addNotification('error', 'Password must be at least 6 characters');
       return;
     }

     this.authService.changePassword(this.passwordData.newPassword);
     this.isChangingPassword = false;
     this.stateService.addNotification('success', 'Password changed successfully');
   }
}
