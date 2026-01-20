import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ParcelService } from '../../core/services/parcel/parcel.service';
import { Parcel, DeliveryHistory, ParcelStatus } from '../../core/models/parcel.model';

@Component({
  selector: 'app-livreur-parcel-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './livreur-parcel-details.html'
})
export class LivreurParcelDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parcelService = inject(ParcelService);
  private readonly snackBar = inject(MatSnackBar);

  parcel = signal<Parcel | null>(null);
  trackingHistory = signal<DeliveryHistory[]>([]);
  loading = signal(true);
  updating = signal(false);

  // Available status transitions for livreur
  statusTransitions: { [key: string]: { next: ParcelStatus; label: string; icon: string; color: string }[] } = {
    'CREATED': [
      { next: ParcelStatus.COLLECTED, label: 'Marquer comme Collecte', icon: 'inventory_2', color: 'primary' }
    ],
    'COLLECTED': [
      { next: ParcelStatus.IN_STOCK, label: 'Mettre en Stock', icon: 'warehouse', color: 'accent' },
      { next: ParcelStatus.IN_TRANSIT, label: 'Demarrer la Livraison', icon: 'local_shipping', color: 'primary' }
    ],
    'IN_STOCK': [
      { next: ParcelStatus.IN_TRANSIT, label: 'Demarrer la Livraison', icon: 'local_shipping', color: 'primary' }
    ],
    'IN_TRANSIT': [
      { next: ParcelStatus.DELIVERED, label: 'Marquer comme Livre', icon: 'check_circle', color: 'accent' }
    ],
    'DELIVERED': []
  };

  // Timeline steps
  timelineSteps = [
    { status: ParcelStatus.CREATED, label: 'Cree', icon: 'add_circle' },
    { status: ParcelStatus.COLLECTED, label: 'Collecte', icon: 'inventory_2' },
    { status: ParcelStatus.IN_STOCK, label: 'En stock', icon: 'warehouse' },
    { status: ParcelStatus.IN_TRANSIT, label: 'En transit', icon: 'local_shipping' },
    { status: ParcelStatus.DELIVERED, label: 'Livre', icon: 'check_circle' }
  ];

  ngOnInit(): void {
    const parcelId = this.route.snapshot.paramMap.get('id');
    if (parcelId) {
      this.loadParcelDetails(parcelId);
      this.loadTrackingHistory(parcelId);
    }
  }

  loadParcelDetails(id: string): void {
    this.parcelService.getParcelById(id).subscribe({
      next: (parcel) => {
        this.parcel.set(parcel);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading parcel:', error);
        this.loading.set(false);
        this.snackBar.open('Erreur lors du chargement du colis', 'Fermer', { duration: 3000 });
      }
    });
  }

  loadTrackingHistory(id: string): void {
    this.parcelService.trackParcel(id).subscribe({
      next: (history) => {
        this.trackingHistory.set(history);
      },
      error: (error) => {
        console.error('Error loading tracking history:', error);
      }
    });
  }

  getAvailableTransitions(): { next: ParcelStatus; label: string; icon: string; color: string }[] {
    const currentStatus = this.parcel()?.status;
    if (!currentStatus) return [];
    return this.statusTransitions[currentStatus] || [];
  }

  updateStatus(newStatus: ParcelStatus): void {
    const parcelId = this.parcel()?.id;
    if (!parcelId) return;

    this.updating.set(true);

    this.parcelService.updateParcelStatus(parcelId, newStatus).subscribe({
      next: (updatedParcel) => {
        this.parcel.set(updatedParcel);
        this.loadTrackingHistory(parcelId);
        this.updating.set(false);
        this.snackBar.open('Statut mis a jour avec succes!', 'OK', {
          duration: 3000,
          panelClass: ['snackbar-success']
        });
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.updating.set(false);
        this.snackBar.open('Erreur lors de la mise a jour du statut', 'Fermer', {
          duration: 3000,
          panelClass: ['snackbar-error']
        });
      }
    });
  }

  getCurrentStepIndex(): number {
    const currentStatus = this.parcel()?.status;
    return this.timelineSteps.findIndex(step => step.status === currentStatus);
  }

  isStepCompleted(stepIndex: number): boolean {
    return stepIndex <= this.getCurrentStepIndex();
  }

  isStepActive(stepIndex: number): boolean {
    return stepIndex === this.getCurrentStepIndex();
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

  goBack(): void {
    this.router.navigate(['/livreur/dashboard']);
  }

  callRecipient(): void {
    const phone = this.parcel()?.recipientPhone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  }

  openMaps(): void {
    const address = this.parcel()?.recipientAddress;
    const city = this.parcel()?.destinationCity;
    if (address || city) {
      const query = encodeURIComponent(`${address || ''} ${city || ''}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }
}
