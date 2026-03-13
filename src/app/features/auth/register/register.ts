import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule} from '@angular/material/select'
import { MatInputModule } from "@angular/material/input";
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from "@angular/forms";
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth/auth';
import { StateService } from '../../../core/services/state/state';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";

@Component({
  selector: 'app-register',
  imports: [MatCardModule, MatSelectModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, FormsModule, MatIconModule, ReactiveFormsModule, MatButtonModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private stateService = inject(StateService);
  private router = inject(Router);

  registerForm!: FormGroup;
  hidePassword = true;
  errorMessage = '';
  isLoading = false;

  // Getter for form controls
  get f() {
    return this.registerForm.controls;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      gender: ['', Validators.required],
      role: ['user', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      agreeToTerms: [false, Validators.requiredTrue]
    }, {
      // Custom validator for password and confirm password
      validators: this.passwordMatchValidator
    });
  }

  // CUSTOM VALIDATOR - Check if passwords match
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if(!password || !confirmPassword) return null;

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  //Handle form submission
  onSubmit(): void {
    if(this.registerForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.stateService.showLoader();

    const formData = this.registerForm.value;

    this.authService.register(formData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.stateService.hideLoader();
        this.stateService.addNotification('success', 'Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.isLoading = false;
        this.stateService.hideLoader();
        this.errorMessage = 'Registration failed Please try again.';
        this.stateService.addNotification('error', 'Registration failed.');
      }
    });
  }
}
