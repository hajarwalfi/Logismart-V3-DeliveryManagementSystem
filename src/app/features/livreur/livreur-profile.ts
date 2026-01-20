import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../core/services/auth.service';
import { DeliveryPersonService } from '../../core/services/delivery-person/delivery-person.service';
import { ParcelService } from '../../core/services/parcel/parcel.service';
import { DeliveryPerson, DeliveryPersonStats } from '../../core/models/delivery-person.model';
import { Parcel } from '../../core/models/parcel.model';

@Component({
  selector: 'app-livreur-profile',
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
    MatTableModule,
    MatPaginatorModule,
    MatTabsModule,
    MatTooltipModule
  ],
  templateUrl: './livreur-profile.html'
})
export class LivreurProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly deliveryPersonService = inject(DeliveryPersonService);
  private readonly parcelService = inject(ParcelService);
  private readonly router = inject(Router);

  // Data signals
  profile = signal<DeliveryPerson | null>(null);
  stats = signal<DeliveryPersonStats | null>(null);
  deliveryHistory = signal<Parcel[]>([]);

  // Loading states
  loadingProfile = signal(true);
  loadingStats = signal(true);
  loadingHistory = signal(true);

  // Error states
  errorProfile = signal<string | null>(null);
  errorStats = signal<string | null>(null);
  errorHistory = signal<string | null>(null);

  // Pagination for history
  historyPage = signal(0);
  historyPageSize = signal(10);

  // Table columns for history
  historyColumns: string[] = ['date', 'trackingId', 'recipient', 'destination', 'status'];

  // Computed: paginated history
  paginatedHistory = computed(() => {
    const history = this.deliveryHistory();
    const start = this.historyPage() * this.historyPageSize();
    const end = start + this.historyPageSize();
    return history.slice(start, end);
  });

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadStats();
    this.loadDeliveryHistory();
  }

  loadProfile(): void {
    this.loadingProfile.set(true);
    this.errorProfile.set(null);

    this.deliveryPersonService.getMyProfile().subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loadingProfile.set(false);
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.errorProfile.set('Impossible de charger votre profil. Veuillez reessayer.');
        this.loadingProfile.set(false);
      }
    });
  }

  loadStats(): void {
    this.loadingStats.set(true);
    this.errorStats.set(null);

    this.deliveryPersonService.getMyStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        this.loadingStats.set(false);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.errorStats.set('Impossible de charger vos statistiques. Veuillez reessayer.');
        this.loadingStats.set(false);
      }
    });
  }

  loadDeliveryHistory(): void {
    this.loadingHistory.set(true);
    this.errorHistory.set(null);

    this.deliveryPersonService.getMyDeliveryHistory().subscribe({
      next: (history) => {
        // Sort by date descending (most recent first)
        const sorted = history.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.deliveryHistory.set(sorted);
        this.loadingHistory.set(false);
      },
      error: (error) => {
        console.error('Error loading delivery history:', error);
        this.errorHistory.set('Impossible de charger votre historique. Veuillez reessayer.');
        this.loadingHistory.set(false);
      }
    });
  }

  onHistoryPageChange(event: PageEvent): void {
    this.historyPage.set(event.pageIndex);
    this.historyPageSize.set(event.pageSize);
  }

  getStatusColor(status: string): string {
    return this.parcelService.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return this.parcelService.getStatusIcon(status);
  }

  goToDashboard(): void {
    this.router.navigate(['/livreur/dashboard']);
  }

  onLogout(): void {
    this.authService.logout();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
