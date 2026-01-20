import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TrackingService, PublicTrackingResponse } from '../../core/services/tracking/tracking.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  templateUrl: './home.html'
})
export class HomeComponent {
  private readonly trackingService = inject(TrackingService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  // Form fields
  parcelId = signal('');
  email = signal('');

  // State
  loading = signal(false);
  trackingResult = signal<PublicTrackingResponse | null>(null);
  showResult = signal(false);
  error = signal<string | null>(null);

  // Timeline steps
  timelineSteps = [
    { status: 'CREATED', label: 'Cree', icon: 'add_circle' },
    { status: 'COLLECTED', label: 'Collecte', icon: 'inventory_2' },
    { status: 'IN_STOCK', label: 'En stock', icon: 'warehouse' },
    { status: 'IN_TRANSIT', label: 'En transit', icon: 'local_shipping' },
    { status: 'DELIVERED', label: 'Livre', icon: 'check_circle' }
  ];

  onTrack(): void {
    if (!this.parcelId() || !this.email()) {
      this.snackBar.open('Veuillez remplir tous les champs', 'Fermer', { duration: 3000 });
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.trackingResult.set(null);
    this.showResult.set(false);

    this.trackingService.trackParcel({
      parcelId: this.parcelId(),
      email: this.email()
    }).subscribe({
      next: (result) => {
        this.trackingResult.set(result);
        this.showResult.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 404) {
          this.error.set('Colis non trouve. Verifiez l\'ID du colis.');
        } else if (err.status === 400) {
          this.error.set('L\'email ne correspond pas au destinataire de ce colis.');
        } else {
          this.error.set('Une erreur est survenue. Veuillez reessayer.');
        }
        this.snackBar.open(this.error()!, 'Fermer', { duration: 5000 });
      }
    });
  }

  getCurrentStepIndex(): number {
    const result = this.trackingResult();
    if (!result) return -1;
    return this.timelineSteps.findIndex(step => step.status === result.status);
  }

  isStepCompleted(stepIndex: number): boolean {
    return stepIndex <= this.getCurrentStepIndex();
  }

  isStepActive(stepIndex: number): boolean {
    return stepIndex === this.getCurrentStepIndex();
  }

  getStatusColor(status: string): string {
    return this.trackingService.getStatusColor(status);
  }

  getStatusIcon(status: string): string {
    return this.trackingService.getStatusIcon(status);
  }

  getPriorityColor(priority: string): string {
    return this.trackingService.getPriorityColor(priority);
  }

  clearResult(): void {
    this.trackingResult.set(null);
    this.showResult.set(false);
    this.parcelId.set('');
    this.email.set('');
    this.error.set(null);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
