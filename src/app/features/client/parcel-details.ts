import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatStepperModule } from '@angular/material/stepper';

import { ParcelService } from '../../core/services/parcel/parcel.service';
import { Parcel, DeliveryHistory, ParcelStatus } from '../../core/models/parcel.model';

@Component({
  selector: 'app-parcel-details',
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
    MatTableModule,
    MatStepperModule
  ],
  templateUrl: './parcel-details.html'
})
export class ParcelDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly parcelService = inject(ParcelService);

  parcel = signal<Parcel | null>(null);
  trackingHistory = signal<DeliveryHistory[]>([]);
  loading = signal(true);

  // Timeline steps
  timelineSteps = [
    { status: ParcelStatus.CREATED, label: 'Créé', icon: 'add_circle' },
    { status: ParcelStatus.COLLECTED, label: 'Collecté', icon: 'inventory_2' },
    { status: ParcelStatus.IN_STOCK, label: 'En stock', icon: 'warehouse' },
    { status: ParcelStatus.IN_TRANSIT, label: 'En transit', icon: 'local_shipping' },
    { status: ParcelStatus.DELIVERED, label: 'Livré', icon: 'check_circle' }
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
    this.router.navigate(['/client/dashboard']);
  }

  copyTrackingId(): void {
    const id = this.parcel()?.id;
    if (id) {
      navigator.clipboard.writeText(id);
      // TODO: Add snackbar notification
      console.log('Tracking ID copied!');
    }
  }
}