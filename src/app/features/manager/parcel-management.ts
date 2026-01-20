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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';
import { ParcelService } from '../../core/services/parcel/parcel.service';
import { DeliveryPersonService } from '../../core/services/delivery-person/delivery-person.service';
import { ZoneService } from '../../core/services/zone/zone.service';
import { Parcel, ParcelStatus, ParcelPriority } from '../../core/models/parcel.model';
import { DeliveryPerson } from '../../core/models/delivery-person.model';
import { Zone } from '../../core/models/zone.model';

@Component({
  selector: 'app-parcel-management',
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './parcel-management.html'
})
export class ParcelManagementComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly parcelService = inject(ParcelService);
  private readonly deliveryPersonService = inject(DeliveryPersonService);
  private readonly zoneService = inject(ZoneService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Data
  allParcels = signal<Parcel[]>([]);
  deliveryPersons = signal<DeliveryPerson[]>([]);
  zones = signal<Zone[]>([]);
  loading = signal(true);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);

  // Filters
  selectedStatus = signal<ParcelStatus | ''>('');
  selectedPriority = signal<ParcelPriority | ''>('');
  selectedZone = signal<string>('');
  searchTerm = signal('');
  showUnassignedOnly = signal(false);

  // Enums
  parcelStatuses = Object.values(ParcelStatus);
  parcelPriorities = Object.values(ParcelPriority);

  // Table columns
  displayedColumns: string[] = [
    'priority',
    'id',
    'sender',
    'recipient',
    'destination',
    'status',
    'deliveryPerson',
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
    if (this.selectedZone()) {
      parcels = parcels.filter(p => p.zoneId === this.selectedZone());
    }
    if (this.showUnassignedOnly()) {
      parcels = parcels.filter(p => !p.deliveryPersonId);
    }
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      parcels = parcels.filter(p =>
        p.id.toLowerCase().includes(search) ||
        p.recipientName?.toLowerCase().includes(search) ||
        p.senderClientName?.toLowerCase().includes(search) ||
        p.destinationCity?.toLowerCase().includes(search)
      );
    }

    return parcels;
  });

  totalElements = computed(() => this.filteredParcels().length);

  paginatedParcels = computed(() => {
    const filtered = this.filteredParcels();
    const start = this.currentPage() * this.pageSize();
    const end = start + this.pageSize();
    return filtered.slice(start, end);
  });

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);

    // Load parcels, delivery persons, and zones in parallel
    this.parcelService.getAllParcels().subscribe({
      next: (parcels) => {
        this.allParcels.set(parcels);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading parcels:', err);
        this.snackBar.open('Erreur lors du chargement des colis', 'Fermer', { duration: 3000 });
        this.loading.set(false);
      }
    });

    this.deliveryPersonService.getAll().subscribe({
      next: (persons) => this.deliveryPersons.set(persons),
      error: (err) => console.error('Error loading delivery persons:', err)
    });

    this.zoneService.getAll().subscribe({
      next: (zones) => this.zones.set(zones),
      error: (err) => console.error('Error loading zones:', err)
    });
  }

  applyFilters(): void {
    this.currentPage.set(0);
  }

  clearFilters(): void {
    this.selectedStatus.set('');
    this.selectedPriority.set('');
    this.selectedZone.set('');
    this.searchTerm.set('');
    this.showUnassignedOnly.set(false);
    this.currentPage.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  assignDeliveryPerson(parcel: Parcel, deliveryPersonId: string): void {
    this.parcelService.updateParcel(parcel.id, { deliveryPersonId }).subscribe({
      next: (updated) => {
        // Update local data
        const parcels = this.allParcels();
        const index = parcels.findIndex(p => p.id === parcel.id);
        if (index !== -1) {
          parcels[index] = updated;
          this.allParcels.set([...parcels]);
        }
        this.snackBar.open('Livreur assigne avec succes', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error assigning delivery person:', err);
        this.snackBar.open('Erreur lors de l\'assignation', 'Fermer', { duration: 3000 });
      }
    });
  }

  updateStatus(parcel: Parcel, status: ParcelStatus): void {
    this.parcelService.updateParcel(parcel.id, { status }).subscribe({
      next: (updated) => {
        const parcels = this.allParcels();
        const index = parcels.findIndex(p => p.id === parcel.id);
        if (index !== -1) {
          parcels[index] = updated;
          this.allParcels.set([...parcels]);
        }
        this.snackBar.open('Statut mis a jour', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.snackBar.open('Erreur lors de la mise a jour', 'Fermer', { duration: 3000 });
      }
    });
  }

  viewDetails(parcelId: string): void {
    this.router.navigate(['/manager/parcels', parcelId]);
  }

  goBack(): void {
    this.router.navigate(['/manager/dashboard']);
  }

  onLogout(): void {
    this.authService.logout();
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
}
