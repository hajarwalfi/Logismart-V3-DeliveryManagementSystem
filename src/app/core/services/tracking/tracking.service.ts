import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PublicTrackingRequest {
  parcelId: string;
  email: string;
}

export interface DeliveryHistoryItem {
  id: string;
  status: string;
  statusDisplay: string;
  changedAt: string;
  comment: string;
}

export interface PublicTrackingResponse {
  parcelId: string;
  description: string;
  status: string;
  statusDisplay: string;
  priority: string;
  priorityDisplay: string;
  weight: number;
  destinationCity: string;
  recipientName: string;
  senderName: string;
  createdAt: string;
  estimatedDelivery?: string;
  history: DeliveryHistoryItem[];
}

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/public/tracking`;

  /**
   * Track a parcel publicly using parcel ID and recipient email
   */
  trackParcel(request: PublicTrackingRequest): Observable<PublicTrackingResponse> {
    return this.http.post<PublicTrackingResponse>(this.apiUrl, request);
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'CREATED': 'bg-slate-500',
      'COLLECTED': 'bg-blue-500',
      'IN_STOCK': 'bg-amber-500',
      'IN_TRANSIT': 'bg-orange-500',
      'DELIVERED': 'bg-emerald-500'
    };
    return colors[status] || 'bg-slate-500';
  }

  /**
   * Get status icon for UI
   */
  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'CREATED': 'add_circle',
      'COLLECTED': 'inventory_2',
      'IN_STOCK': 'warehouse',
      'IN_TRANSIT': 'local_shipping',
      'DELIVERED': 'check_circle'
    };
    return icons[status] || 'help';
  }

  /**
   * Get priority color for UI
   */
  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'NORMAL': 'text-slate-600',
      'URGENT': 'text-orange-600',
      'EXPRESS': 'text-red-600'
    };
    return colors[priority] || 'text-slate-600';
  }
}