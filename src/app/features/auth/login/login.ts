import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from
    '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './login.html'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  loginForm: FormGroup;
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // Redirect based on the role from response directly
        const dashboardRoute = this.getDashboardRouteFromRole(response.role);
        console.log('Login successful, role:', response.role, 'redirecting to:', dashboardRoute);
        this.router.navigate([dashboardRoute]);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set('Identifiants invalides. Veuillez réessayer.');
        console.error('Login error:', error);
      }
    });
  }

  private getDashboardRouteFromRole(role: string): string {
    // Remove ROLE_ prefix if present
    const normalizedRole = role?.replace('ROLE_', '') || '';
    console.log('Normalized role:', normalizedRole);

    switch (normalizedRole) {
      case 'CLIENT':
        return '/client/dashboard';
      case 'LIVREUR':
        return '/livreur/dashboard';
      case 'MANAGER':
        return '/manager/dashboard';
      default:
        console.warn('Unknown role:', role);
        return '/dashboard';
    }
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }

  loginWithFacebook(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/facebook';
  }

  loginWithApple(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/apple';
  }

  loginWithAuth0(): void {
    window.location.href = 'http://localhost:8080/oauth2/authorization/okta';
  }
}
