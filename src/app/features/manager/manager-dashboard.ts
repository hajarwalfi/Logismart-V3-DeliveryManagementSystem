import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { AuthService } from '../../core/services/auth.service';
import { StatisticsService } from '../../core/services/statistics/statistics.service';
import { GlobalStatistics } from '../../core/models/statistics.model';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './manager-dashboard.html'
})
export class ManagerDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly router = inject(Router);

  // Data
  stats = signal<GlobalStatistics | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading.set(true);
    this.error.set(null);

    this.statisticsService.getGlobalStatistics().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading statistics:', err);
        this.error.set('Impossible de charger les statistiques');
        this.loading.set(false);
      }
    });
  }

  // Navigation methods
  navigateToParcels(): void {
    this.router.navigate(['/manager/parcels']);
  }

  navigateToDeliveryPersons(): void {
    this.router.navigate(['/manager/delivery-persons']);
  }

  navigateToZones(): void {
    this.router.navigate(['/manager/zones']);
  }

  navigateToClients(): void {
    this.router.navigate(['/manager/clients']);
  }

  onLogout(): void {
    this.authService.logout();
  }

  // Helper methods for display
  getStatusCount(status: string): number {
    return this.stats()?.parcelsByStatus?.[status] || 0;
  }

  getPriorityCount(priority: string): number {
    return this.stats()?.parcelsByPriority?.[priority] || 0;
  }
}
