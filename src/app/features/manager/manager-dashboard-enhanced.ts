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
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { forkJoin } from 'rxjs';

import { AuthService } from '../../core/services/auth.service';
import { StatisticsService } from '../../core/services/statistics/statistics.service';
import { ParcelService } from '../../core/services/parcel/parcel.service';
import { DeliveryHistoryService } from '../../core/services/delivery-history/delivery-history.service';
import { GlobalStatistics, DeliveryPersonStatistics, ZoneStatistics } from '../../core/models/statistics.model';
import { KPICard } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-manager-dashboard-enhanced',
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
    MatMenuModule,
    MatTabsModule,
    MatGridListModule
  ],
  templateUrl: './manager-dashboard-enhanced.html'
})
export class ManagerDashboardEnhancedComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly statisticsService = inject(StatisticsService);
  private readonly parcelService = inject(ParcelService);
  private readonly deliveryHistoryService = inject(DeliveryHistoryService);
  private readonly router = inject(Router);

  // Data signals
  globalStats = signal<GlobalStatistics | null>(null);
  deliveryPersonStats = signal<DeliveryPersonStatistics[]>([]);
  zoneStats = signal<ZoneStatistics[]>([]);
  parcelsByStatus = signal<{ [key: string]: number }>({});
  parcelsByPriority = signal<{ [key: string]: number }>({});
  parcelsByZone = signal<{ [key: string]: number }>({});
  deliveriesToday = signal<number>(0);
  unassignedCount = signal<number>(0);
  highPriorityCount = signal<number>(0);

  loading = signal(true);
  error = signal<string | null>(null);

  // Computed KPI cards
  kpiCards = computed<KPICard[]>(() => {
    const stats = this.globalStats();
    if (!stats) return [];

    return [
      {
        title: 'Total Colis',
        value: stats.totalParcels,
        icon: 'inventory_2',
        color: 'primary',
        route: '/manager/parcels'
      },
      {
        title: 'Livraisons Aujourd\'hui',
        value: this.deliveriesToday(),
        icon: 'check_circle',
        color: 'success',
        route: '/manager/parcels'
      },
      {
        title: 'Colis Non Assignés',
        value: this.unassignedCount(),
        icon: 'warning',
        color: 'warn',
        route: '/manager/parcels'
      },
      {
        title: 'Colis Urgents',
        value: this.highPriorityCount(),
        icon: 'bolt',
        color: 'accent',
        route: '/manager/parcels'
      },
      {
        title: 'Zones Actives',
        value: stats.totalZones,
        icon: 'map',
        color: 'primary',
        route: '/manager/zones'
      },
      {
        title: 'Livreurs',
        value: stats.totalDeliveryPersons,
        icon: 'local_shipping',
        color: 'primary',
        route: '/manager/delivery-persons'
      },
      {
        title: 'Clients',
        value: stats.totalSenderClients,
        icon: 'people',
        color: 'primary',
        route: '/manager/clients'
      },
      {
        title: 'Poids Total',
        value: `${(stats.totalWeight ?? 0).toFixed(2)} kg`,
        icon: 'scale',
        color: 'primary'
      }
    ];
  });

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      globalStats: this.statisticsService.getGlobalStatistics(),
      deliveryPersonStats: this.statisticsService.getAllDeliveryPersonStatistics(),
      zoneStats: this.statisticsService.getAllZoneStatistics(),
      parcelsByStatus: this.parcelService.groupByStatus(),
      parcelsByPriority: this.parcelService.groupByPriority(),
      parcelsByZone: this.parcelService.groupByZone(),
      deliveriesToday: this.deliveryHistoryService.countDeliveriesToday(),
      unassignedParcels: this.parcelService.getUnassignedParcels(),
      highPriorityParcels: this.parcelService.getHighPriorityPending()
    }).subscribe({
      next: (data) => {
        this.globalStats.set(data.globalStats);
        this.deliveryPersonStats.set(data.deliveryPersonStats);
        this.zoneStats.set(data.zoneStats);
        this.parcelsByStatus.set(data.parcelsByStatus);
        this.parcelsByPriority.set(data.parcelsByPriority);
        this.parcelsByZone.set(data.parcelsByZone);
        this.deliveriesToday.set(data.deliveriesToday);
        this.unassignedCount.set(data.unassignedParcels.length);
        this.highPriorityCount.set(data.highPriorityParcels.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error.set('Impossible de charger les données du dashboard');
        this.loading.set(false);
      }
    });
  }

  // Navigation methods
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  onLogout(): void {
    this.authService.logout();
  }

  // Helper methods for display
  getStatusCount(status: string): number {
    return this.parcelsByStatus()?.[status] || 0;
  }

  getPriorityCount(priority: string): number {
    return this.parcelsByPriority()?.[priority] || 0;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'CREATED': 'gray',
      'COLLECTED': 'blue',
      'IN_STOCK': 'yellow',
      'IN_TRANSIT': 'orange',
      'DELIVERED': 'green'
    };
    return colors[status] || 'gray';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'NORMAL': 'gray',
      'URGENT': 'orange',
      'EXPRESS': 'red'
    };
    return colors[priority] || 'gray';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'CREATED': 'Créé',
      'COLLECTED': 'Collecté',
      'IN_STOCK': 'En Stock',
      'IN_TRANSIT': 'En Transit',
      'DELIVERED': 'Livré'
    };
    return labels[status] || status;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'NORMAL': 'Normal',
      'URGENT': 'Urgent',
      'EXPRESS': 'Express'
    };
    return labels[priority] || priority;
  }

  // Get top performing delivery persons
  getTopDeliveryPersons(limit: number = 5): DeliveryPersonStatistics[] {
    return this.deliveryPersonStats()
      .sort((a, b) => (b.successRate ?? 0) - (a.successRate ?? 0))
      .slice(0, limit);
  }

  // Get zones with most parcels
  getTopZones(limit: number = 5): ZoneStatistics[] {
    return this.zoneStats()
      .sort((a, b) => b.totalParcels - a.totalParcels)
      .slice(0, limit);
  }

  // Refresh data
  refresh(): void {
    this.loadAllData();
  }
}
