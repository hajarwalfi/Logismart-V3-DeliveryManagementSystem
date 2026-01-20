import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthService } from '../../../core/services/auth.service';
import { ParcelService } from '../../../core/services/parcel/parcel.service';
import { ProductService } from '../../../core/services/product/product.service';
import { ParcelPriority } from '../../../core/models/parcel.model';
import { Product } from '../../../core/models/product.model';

// Interface pour la creation de colis avec destinataire inline
interface ParcelCreateRequest {
  description?: string;
  weight: number;
  priority: string;
  destinationCity: string;
  recipient: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address: string;
  };
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
}

@Component({
  selector: 'app-create-parcel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './create-parcel.html'
})
export class CreateParcelComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);
  private readonly parcelService = inject(ParcelService);
  private readonly productService = inject(ProductService);

  // Form
  parcelForm!: FormGroup;

  // Data
  products = signal<Product[]>([]);
  loading = signal(false);
  submitting = signal(false);

  // Priorities
  priorities = Object.values(ParcelPriority);
  priorityLabels: { [key: string]: string } = {
    'NORMAL': 'Normal (3-5 jours)',
    'URGENT': 'Urgent (1-2 jours)',
    'EXPRESS': 'Express (Meme jour)'
  };

  get currentUser() {
    return this.authService.currentUser;
  }

  get productsFormArray(): FormArray {
    return this.parcelForm.get('products') as FormArray;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
  }

  private initForm(): void {
    this.parcelForm = this.fb.group({
      // Parcel info
      description: ['', [Validators.maxLength(255)]],
      weight: [null, [Validators.required, Validators.min(0.01), Validators.max(999.99)]],
      priority: [ParcelPriority.NORMAL, Validators.required],
      destinationCity: ['', [Validators.required, Validators.maxLength(100)]],

      // Recipient info (saisie directe)
      recipient: this.fb.group({
        firstName: ['', [Validators.required, Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.maxLength(50)]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
        address: ['', [Validators.required, Validators.maxLength(255)]]
      }),

      // Products array
      products: this.fb.array([])
    });

    // Add first product by default
    this.addProduct();
  }

  private loadProducts(): void {
    this.loading.set(true);

    this.productService.getAll().subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Erreur lors du chargement des produits', 'Fermer', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  addProduct(): void {
    const productGroup = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [null, [Validators.required, Validators.min(0)]]
    });

    this.productsFormArray.push(productGroup);
  }

  removeProduct(index: number): void {
    if (this.productsFormArray.length > 1) {
      this.productsFormArray.removeAt(index);
    }
  }

  onProductSelect(index: number): void {
    const productId = this.productsFormArray.at(index).get('productId')?.value;
    const product = this.products().find(p => p.id === productId);
    if (product) {
      this.productsFormArray.at(index).patchValue({
        price: product.price
      });
    }
  }

  calculateTotalPrice(): number {
    let total = 0;
    for (let i = 0; i < this.productsFormArray.length; i++) {
      const product = this.productsFormArray.at(i);
      const quantity = product.get('quantity')?.value || 0;
      const price = product.get('price')?.value || 0;
      total += quantity * price;
    }
    return total;
  }

  onSubmit(): void {
    if (this.parcelForm.invalid) {
      this.markFormGroupTouched(this.parcelForm);
      this.snackBar.open('Veuillez remplir tous les champs obligatoires', 'Fermer', { duration: 3000 });
      return;
    }

    this.submitting.set(true);

    const parcelData: ParcelCreateRequest = {
      description: this.parcelForm.get('description')?.value,
      weight: this.parcelForm.get('weight')?.value,
      priority: this.parcelForm.get('priority')?.value,
      destinationCity: this.parcelForm.get('destinationCity')?.value,
      recipient: this.parcelForm.get('recipient')?.value,
      products: this.productsFormArray.value
    };

    this.parcelService.createParcelWithRecipient(parcelData).subscribe({
      next: (parcel) => {
        this.submitting.set(false);
        this.snackBar.open('Demande de livraison creee avec succes!', 'Voir', {
          duration: 5000
        }).onAction().subscribe(() => {
          this.router.navigate(['/client/parcels', parcel.id]);
        });
        this.router.navigate(['/client/dashboard']);
      },
      error: (error) => {
        console.error('Error creating parcel:', error);
        this.submitting.set(false);
        this.snackBar.open('Erreur lors de la creation de la demande', 'Fermer', { duration: 3000 });
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
      if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markFormGroupTouched(c);
          }
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/client/dashboard']);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
