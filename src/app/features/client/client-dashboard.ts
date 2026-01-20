import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth.service';
import { ParcelService } from '../../core/services/parcel/parcel.service';
import { Parcel, ParcelStatus, ParcelPriority, ParcelFilters } from '../../core/models/parcel.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './client-dashboard.html'
})
export class ClientDashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly parcelService = inject(ParcelService);
  private readonly router = inject(Router);

  // All parcels from API
  allParcels = signal<Parcel[]>([]);
  loading = signal(true);

  // Pagination (client-side)
  currentPage = signal(0);
  pageSize = signal(10);

  // Filters
  selectedStatus = signal<ParcelStatus | ''>('');
  selectedPriority = signal<ParcelPriority | ''>('');
  searchTerm = signal('');
  cityFilter = signal('');

  // Enums for template
  parcelStatuses = Object.values(ParcelStatus);
  parcelPriorities = Object.values(ParcelPriority);

  // Table columns
  displayedColumns: string[] = [
    'trackingId',
    'description',
    'recipient',
    'destination',
    'status',
    'priority',
    'createdAt',
    'actions'
  ];

  // Computed: filtered parcels
  filteredParcels = computed(() => {
    let parcels = this.allParcels();

    if (this.selectedStatus()) {
      parcels = parcels.filter(p => p.status === this.selectedStatus());
    }
    if (this.selectedPriority()) {
      parcels = parcels.filter(p => p.priority === this.selectedPriority());
    }
    if (this.cityFilter()) {
      const city = this.cityFilter().toLowerCase();
      parcels = parcels.filter(p => p.destinationCity?.toLowerCase().includes(city));
    }
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      parcels = parcels.filter(p =>
        p.description?.toLowerCase().includes(search) ||
        p.id.toLowerCase().includes(search) ||
        p.recipientName?.toLowerCase().includes(search)
      );
    }

    return parcels;
  });

  // Computed: total elements after filtering
  totalElements = computed(() => this.filteredParcels().length);

  // Computed: paginated parcels for display
  parcels = computed(() => {
    const filtered = this.filteredParcels();
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadParcels();
  }

  loadParcels(): void {
    this.loading.set(true);

    this.parcelService.getMyParcels().subscribe({
      next: (parcels) => {
        this.allParcels.set(parcels);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading parcels:', error);
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(0);
  }

  clearFilters(): void {
    this.selectedStatus.set('');
    this.selectedPriority.set('');
    this.searchTerm.set('');
    this.cityFilter.set('');
    this.currentPage.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  viewParcelDetails(parcelId: string): void {
    this.router.navigate(['/client/parcels', parcelId]);
  }

  getStatusColor(status: string): string {
    return this.parcelService.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return this.parcelService.getStatusIcon(status);
  }

  getPriorityColor(priority: string): string {
    return this.parcelService.getPriorityColor(priority);
  }

  getPriorityIcon(priority: string): string {
    return this.parcelService.getPriorityIcon(priority);
  }

  onLogout(): void {
    this.authService.logout();
  }
}