import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatToolbarModule
  ],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get currentUser() {
    return this.authService.currentUser;
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  ngOnInit(): void {
    // Redirect to role-specific dashboard if user has a role
    const role = this.authService.userRole();
    if (role) {
      const dashboardRoute = this.authService.getDashboardRoute();
      if (dashboardRoute !== '/dashboard') {
        console.log('Redirecting to role-specific dashboard:', dashboardRoute);
        this.router.navigate([dashboardRoute]);
      }
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}
