import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../../core/services/auth/auth';
import { StateService } from '../../../core/services/state/state';

@Component({
  selector: 'app-login',
  imports: [MatCardModule, MatIconModule, MatInputModule, FormsModule, MatFormFieldModule, MatButtonModule, MatCheckboxModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
// Services injection
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  private router = inject(Router);

  // Component state
  credentials = {
    username: '',
    password: '',
    rememberMe: false
  };

  hidePassword = true;
  errorMessage = '';
  isLoading = false;

  // Handle Form Submission
  onSubmit(form:any) {
    if(form.invalid) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    this.stateService.showLoader();

    // Call AuthService login method
    this.authService.login(this.credentials.username, this.credentials.password).subscribe({next: (response) => {
      console.log('Login successful:', response);
      this.stateService.hideLoader();
      this.stateService.addNotification('success', `Welcome back ${response.firstName}!`);
    },
    error: (error) => {
      console.log('Login Error:', error);
      setTimeout(() => {
        this.isLoading = false;
        this.stateService.hideLoader();
        this.errorMessage = 'Invalid username or password, Please try again.';
        this.stateService.addNotification('error', 'Login failed. Pleased check your credentials.')
      }, 0);
    }
  })
  }
}
