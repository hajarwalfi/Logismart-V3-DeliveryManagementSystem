import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { SenderClientService } from '../../core/services/sender-client/sender-client.service';
import { ParcelService } from '../../core/services/parcel/parcel.service';
import { SenderClient, SenderClientUpdate } from '../../core/models/sender-client.model';
import { Parcel } from '../../core/models/parcel.model';

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './client-management.html'
})
export class ClientManagementComponent implements OnInit {
  private readonly senderClientService = inject(SenderClientService);
  private readonly parcelService = inject(ParcelService);
  private readonly snackBar = inject(MatSnackBar);

  // Data
  clients = signal<SenderClient[]>([]);
  filteredClients = signal<SenderClient[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  searchTerm = signal('');

  // View mode signals
  isViewingDetails = signal(false);
  selectedClient = signal<SenderClient | null>(null);
  clientInProgressParcels = signal<Parcel[]>([]);
  clientDeliveredParcels = signal<Parcel[]>([]);
  loadingClientDetails = signal(false);

  // Edit mode signals
  isEditing = signal(false);
  editingClient = signal<SenderClient | null>(null);
  editFirstName = signal('');
  editLastName = signal('');
  editEmail = signal('');
  editPhone = signal('');
  editAddress = signal('');
  saving = signal(false);

  displayedColumns: string[] = ['name', 'email', 'phone', 'address', 'parcelsCount', 'actions'];
  parcelColumns: string[] = ['id', 'description', 'destination', 'status', 'priority'];

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading.set(true);
    this.error.set(null);

    this.senderClientService.getAll().subscribe({
      next: (clients) => {
        this.clients.set(clients);
        this.filteredClients.set(clients);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading clients:', err);
        this.error.set('Impossible de charger les clients');
        this.loading.set(false);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      this.filteredClients.set(this.clients());
      return;
    }

    const filtered = this.clients().filter(client =>
      client.firstName?.toLowerCase().includes(term) ||
      client.lastName?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    );
    this.filteredClients.set(filtered);
  }

  // View Client Details
  viewClientDetails(client: SenderClient): void {
    this.selectedClient.set(client);
    this.isViewingDetails.set(true);
    this.isEditing.set(false);
    this.loadClientParcels(client.id);
  }

  private loadClientParcels(clientId: string): void {
    this.loadingClientDetails.set(true);

    forkJoin({
      inProgress: this.senderClientService.getInProgressParcels(clientId),
      delivered: this.senderClientService.getDeliveredParcels(clientId)
    }).subscribe({
      next: (data) => {
        this.clientInProgressParcels.set(data.inProgress);
        this.clientDeliveredParcels.set(data.delivered);
        this.loadingClientDetails.set(false);
      },
      error: (err) => {
        console.error('Error loading client parcels:', err);
        this.clientInProgressParcels.set([]);
        this.clientDeliveredParcels.set([]);
        this.loadingClientDetails.set(false);
      }
    });
  }

  closeDetails(): void {
    this.isViewingDetails.set(false);
    this.selectedClient.set(null);
    this.clientInProgressParcels.set([]);
    this.clientDeliveredParcels.set([]);
  }

  // Edit Client
  editClient(client: SenderClient): void {
    this.editingClient.set(client);
    this.editFirstName.set(client.firstName);
    this.editLastName.set(client.lastName);
    this.editEmail.set(client.email);
    this.editPhone.set(client.phone);
    this.editAddress.set(client.address);
    this.isEditing.set(true);
    this.isViewingDetails.set(false);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editingClient.set(null);
    this.resetEditForm();
  }

  private resetEditForm(): void {
    this.editFirstName.set('');
    this.editLastName.set('');
    this.editEmail.set('');
    this.editPhone.set('');
    this.editAddress.set('');
  }

  saveClient(): void {
    const client = this.editingClient();
    if (!client) return;

    this.saving.set(true);

    const updateData: SenderClientUpdate = {
      id: client.id,
      firstName: this.editFirstName(),
      lastName: this.editLastName(),
      email: this.editEmail(),
      phone: this.editPhone(),
      address: this.editAddress()
    };

    this.senderClientService.update(client.id, updateData).subscribe({
      next: (updated) => {
        // Update the client in the list
        const clients = this.clients();
        const index = clients.findIndex(c => c.id === client.id);
        if (index !== -1) {
          clients[index] = updated;
          this.clients.set([...clients]);
          this.filteredClients.set([...clients]);
        }
        this.snackBar.open('Client mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.cancelEdit();
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Error updating client:', err);
        this.snackBar.open('Erreur lors de la mise à jour du client', 'Fermer', { duration: 3000 });
        this.saving.set(false);
      }
    });
  }

  deleteClient(client: SenderClient): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le client ${client.firstName} ${client.lastName} ?`)) {
      this.senderClientService.delete(client.id).subscribe({
        next: () => {
          this.loadClients();
          this.snackBar.open('Client supprimé', 'Fermer', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error deleting client:', err);
          this.snackBar.open('Erreur lors de la suppression du client', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  // Helper methods for parcel display
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'CREATED': 'default',
      'COLLECTED': 'primary',
      'IN_STOCK': 'accent',
      'IN_TRANSIT': 'primary',
      'DELIVERED': 'accent'
    };
    return colors[status] || 'default';
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

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'NORMAL': 'default',
      'URGENT': 'warn',
      'EXPRESS': 'accent'
    };
    return colors[priority] || 'default';
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'NORMAL': 'Normal',
      'URGENT': 'Urgent',
      'EXPRESS': 'Express'
    };
    return labels[priority] || priority;
  }

  refresh(): void {
    this.loadClients();
  }
}
