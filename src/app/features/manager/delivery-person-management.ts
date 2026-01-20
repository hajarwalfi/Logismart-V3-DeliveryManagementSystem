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
import { DeliveryPersonService } from '../../core/services/delivery-person/delivery-person.service';
import { ZoneService } from '../../core/services/zone/zone.service';
import { DeliveryPerson, DeliveryPersonCreate, DeliveryPersonUpdate } from '../../core/models/delivery-person.model';
import { Zone } from '../../core/models/zone.model';

@Component({
  selector: 'app-delivery-person-management',
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
  templateUrl: './delivery-person-management.html'
})
export class DeliveryPersonManagementComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly deliveryPersonService = inject(DeliveryPersonService);
  private readonly zoneService = inject(ZoneService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Data
  allDeliveryPersons = signal<DeliveryPerson[]>([]);
  zones = signal<Zone[]>([]);
  loading = signal(true);

  // Pagination
  currentPage = signal(0);
  pageSize = signal(10);

  // Filters
  selectedZone = signal<string>('');
  searchTerm = signal('');
  showUnassignedOnly = signal(false);
  showAvailableOnly = signal(false);

  // Create/Edit mode
  isCreating = signal(false);
  isEditing = signal(false);
  editingPerson = signal<DeliveryPerson | null>(null);
  saving = signal(false);

  // Form fields
  formFirstName = signal('');
  formLastName = signal('');
  formPhone = signal('');
  formVehicle = signal('');
  formZoneId = signal('');

  // Vehicle types
  vehicleTypes = ['MOTO', 'VOITURE', 'CAMIONNETTE', 'VELO'];

  // Table columns
  displayedColumns: string[] = ['name', 'phone', 'vehicle', 'zone', 'status', 'actions'];

  // Computed: filtered delivery persons
  filteredPersons = computed(() => {
    let persons = this.allDeliveryPersons();

    if (this.selectedZone()) {
      persons = persons.filter(p => p.assignedZoneId === this.selectedZone());
    }
    if (this.showUnassignedOnly()) {
      persons = persons.filter(p => !p.hasAssignedZone);
    }
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      persons = persons.filter(p =>
        p.fullName.toLowerCase().includes(search) ||
        p.phone.toLowerCase().includes(search)
      );
    }

    return persons;
  });

  totalElements = computed(() => this.filteredPersons().length);

  paginatedPersons = computed(() => {
    const filtered = this.filteredPersons();
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

    this.deliveryPersonService.getAll().subscribe({
      next: (persons) => {
        this.allDeliveryPersons.set(persons);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading delivery persons:', err);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.loading.set(false);
      }
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
    this.selectedZone.set('');
    this.searchTerm.set('');
    this.showUnassignedOnly.set(false);
    this.showAvailableOnly.set(false);
    this.currentPage.set(0);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  assignZone(person: DeliveryPerson, zoneId: string): void {
    // Send complete update object to avoid backend validation errors
    // Backend requires firstName, lastName, and phone (all @NotBlank)
    const updateData: DeliveryPersonUpdate = {
      firstName: person.firstName,
      lastName: person.lastName,
      phone: person.phone,
      vehicle: person.vehicle || undefined,
      assignedZoneId: zoneId || undefined
    };

    console.log('Assigning zone:', zoneId, 'to person:', person.id, 'with data:', updateData);

    this.deliveryPersonService.update(person.id, updateData).subscribe({
      next: (updated) => {
        const persons = this.allDeliveryPersons();
        const index = persons.findIndex(p => p.id === person.id);
        if (index !== -1) {
          persons[index] = updated;
          this.allDeliveryPersons.set([...persons]);
        }
        this.snackBar.open('Zone assignée avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Error assigning zone:', err);
        console.error('Error details:', err.error);
        
        // Extract specific validation errors if available
        let errorMsg = 'Erreur lors de l\'assignation';
        
        if (err.error?.validationErrors) {
          // Display specific field validation errors
          const validationErrors = err.error.validationErrors;
          const errorFields = Object.keys(validationErrors);
          
          if (errorFields.length > 0) {
            console.error('Validation errors:', validationErrors);
            errorMsg = `Erreur de validation: ${errorFields.map(field => 
              `${field}: ${validationErrors[field]}`
            ).join(', ')}`;
          }
        } else if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        this.snackBar.open(errorMsg, 'Fermer', { duration: 5000 });
      }
    });
  }

  deletePerson(person: DeliveryPerson): void {
    if (confirm(`Etes-vous sur de vouloir supprimer ${person.fullName} ?`)) {
      this.deliveryPersonService.delete(person.id).subscribe({
        next: () => {
          const persons = this.allDeliveryPersons().filter(p => p.id !== person.id);
          this.allDeliveryPersons.set(persons);
          this.snackBar.open('Livreur supprime', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error deleting delivery person:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/manager/dashboard']);
  }

  onLogout(): void {
    this.authService.logout();
  }

  getVehicleIcon(vehicleType: string): string {
    const icons: { [key: string]: string } = {
      'MOTO': 'two_wheeler',
      'VOITURE': 'directions_car',
      'CAMIONNETTE': 'local_shipping',
      'VELO': 'pedal_bike'
    };
    return icons[vehicleType] || 'local_shipping';
  }

  // ==================== CREATE/EDIT METHODS ====================

  openCreateForm(): void {
    this.resetForm();
    this.isCreating.set(true);
    this.isEditing.set(false);
  }

  openEditForm(person: DeliveryPerson): void {
    this.editingPerson.set(person);
    this.formFirstName.set(person.firstName);
    this.formLastName.set(person.lastName);
    this.formPhone.set(person.phone);
    this.formVehicle.set(person.vehicle || '');
    this.formZoneId.set(person.assignedZoneId || '');
    this.isEditing.set(true);
    this.isCreating.set(false);
  }

  cancelForm(): void {
    this.isCreating.set(false);
    this.isEditing.set(false);
    this.editingPerson.set(null);
    this.resetForm();
  }

  private resetForm(): void {
    this.formFirstName.set('');
    this.formLastName.set('');
    this.formPhone.set('');
    this.formVehicle.set('');
    this.formZoneId.set('');
  }

  savePerson(): void {
    if (!this.formFirstName() || !this.formLastName() || !this.formPhone()) {
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    this.saving.set(true);

    if (this.isCreating()) {
      const createData: DeliveryPersonCreate = {
        firstName: this.formFirstName(),
        lastName: this.formLastName(),
        phone: this.formPhone(),
        vehicle: this.formVehicle() || undefined,
        assignedZoneId: this.formZoneId() || undefined
      };

      this.deliveryPersonService.create(createData).subscribe({
        next: (created) => {
          this.allDeliveryPersons.set([...this.allDeliveryPersons(), created]);
          this.snackBar.open('Livreur créé avec succès', 'Fermer', { duration: 3000 });
          this.cancelForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error creating delivery person:', err);
          this.snackBar.open('Erreur lors de la création', 'Fermer', { duration: 3000 });
          this.saving.set(false);
        }
      });
    } else if (this.isEditing() && this.editingPerson()) {
      const updateData: DeliveryPersonUpdate = {
        firstName: this.formFirstName(),
        lastName: this.formLastName(),
        phone: this.formPhone(),
        vehicle: this.formVehicle() || undefined,
        assignedZoneId: this.formZoneId() || undefined
      };

      this.deliveryPersonService.update(this.editingPerson()!.id, updateData).subscribe({
        next: (updated) => {
          const persons = this.allDeliveryPersons();
          const index = persons.findIndex(p => p.id === updated.id);
          if (index !== -1) {
            persons[index] = updated;
            this.allDeliveryPersons.set([...persons]);
          }
          this.snackBar.open('Livreur mis à jour avec succès', 'Fermer', { duration: 3000 });
          this.cancelForm();
          this.saving.set(false);
        },
        error: (err) => {
          console.error('Error updating delivery person:', err);
          this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
          this.saving.set(false);
        }
      });
    }
  }
}
