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
import { ZoneService } from '../../core/services/zone/zone.service';
import { Zone } from '../../core/models/zone.model';

@Component({
  selector: 'app-zone-management',
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
  templateUrl: './zone-management.html'
})
export class ZoneManagementComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly zoneService = inject(ZoneService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Data
  allZones = signal<Zone[]>([]);
  loading = signal(true);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);

  // Filters
  searchTerm = signal('');

  // Create/Edit mode
  isCreating = signal(false);
  isEditing = signal(false);
  editingZone = signal<Zone | null>(null);

  // Form fields
  newZoneName = signal('');
  newZonePostalCode = signal('');

  // Table columns
  displayedColumns: string[] = ['name', 'postalCode', 'deliveryPersons', 'parcels', 'actions'];

  // Computed: filtered zones
  filteredZones = computed(() => {
    let zones = this.allZones();

    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      zones = zones.filter(z =>
        z.name.toLowerCase().includes(search) ||
        z.postalCode.toLowerCase().includes(search)
      );
    }

    return zones;
  });

  totalElements = computed(() => this.filteredZones().length);

  paginatedZones = computed(() => {
    const filtered = this.filteredZones();
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

    this.zoneService.getAll().subscribe({
      next: (zones) => {
        this.allZones.set(zones);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading zones:', err);
        this.snackBar.open('Erreur lors du chargement des zones', 'Fermer', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  applyFilters(): void {
    this.currentPage.set(0);
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.currentPage.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  // Create Zone
  startCreating(): void {
    this.isCreating.set(true);
    this.isEditing.set(false);
    this.editingZone.set(null);
    this.resetForm();
  }

  cancelCreate(): void {
    this.isCreating.set(false);
    this.resetForm();
  }

  createZone(): void {
    const zoneData = {
      name: this.newZoneName(),
      postalCode: this.newZonePostalCode()
    };

    this.zoneService.create(zoneData).subscribe({
      next: (created) => {
        this.allZones.set([...this.allZones(), created]);
        this.snackBar.open('Zone creee avec succes', 'Fermer', { duration: 3000 });
        this.cancelCreate();
      },
      error: (err) => {
        console.error('Error creating zone:', err);
        this.snackBar.open('Erreur lors de la creation', 'Fermer', { duration: 3000 });
      }
    });
  }

  // Edit Zone
  startEditing(zone: Zone): void {
    this.isEditing.set(true);
    this.isCreating.set(false);
    this.editingZone.set(zone);
    this.newZoneName.set(zone.name);
    this.newZonePostalCode.set(zone.postalCode);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editingZone.set(null);
    this.resetForm();
  }

  updateZone(): void {
    const zone = this.editingZone();
    if (!zone) return;

    const zoneData = {
      id: zone.id,
      name: this.newZoneName(),
      postalCode: this.newZonePostalCode()
    };

    this.zoneService.update(zone.id, zoneData).subscribe({
      next: (updated) => {
        const zones = this.allZones();
        const index = zones.findIndex(z => z.id === zone.id);
        if (index !== -1) {
          zones[index] = updated;
          this.allZones.set([...zones]);
        }
        this.snackBar.open('Zone mise a jour', 'Fermer', { duration: 3000 });
        this.cancelEdit();
      },
      error: (err) => {
        console.error('Error updating zone:', err);
        this.snackBar.open('Erreur lors de la mise a jour', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteZone(zone: Zone): void {
    if (confirm(`Etes-vous sur de vouloir supprimer la zone "${zone.name}" ?`)) {
      this.zoneService.delete(zone.id).subscribe({
        next: () => {
          const zones = this.allZones().filter(z => z.id !== zone.id);
          this.allZones.set(zones);
          this.snackBar.open('Zone supprimee', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error deleting zone:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  private resetForm(): void {
    this.newZoneName.set('');
    this.newZonePostalCode.set('');
  }

  goBack(): void {
    this.router.navigate(['/manager/dashboard']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
