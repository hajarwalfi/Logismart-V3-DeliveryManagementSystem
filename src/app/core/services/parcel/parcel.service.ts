import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Parcel, ParcelFilters, DeliveryHistory } from '../../models/parcel.model';
import { environment } from '../../../../environments/environment';
import { ParcelSearchFilters, PageableRequest, PageableResponse } from '../../models/dashboard.model';
import { ParcelStatus, ParcelPriority } from '../../models/delivery-history.model';

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/parcels`;

  /**
   * Get all parcels for the current client (authenticated)
   * Backend returns List<ParcelResponseDTO>, we filter client-side
   */
  getMyParcels(filters?: ParcelFilters): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/my-parcels`).pipe(
      map(parcels => this.applyFilters(parcels, filters))
    );
  }

  /**
   * Apply filters client-side since backend returns all parcels
   */
  private applyFilters(parcels: Parcel[], filters?: ParcelFilters): Parcel[] {
    if (!filters) return parcels;

    return parcels.filter(parcel => {
      if (filters.status && parcel.status !== filters.status) return false;
      if (filters.priority && parcel.priority !== filters.priority) return false;
      if (filters.city && !parcel.destinationCity.toLowerCase().includes(filters.city.toLowerCase())) return false;
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        const matchesDescription = parcel.description?.toLowerCase().includes(search);
        const matchesId = parcel.id.toLowerCase().includes(search);
        const matchesRecipient = parcel.recipientName?.toLowerCase().includes(search);
        if (!matchesDescription && !matchesId && !matchesRecipient) return false;
      }
      return true;
    });
  }

  /**
   * Get all parcels (MANAGER only)
   * Returns all parcels in the system
   */
  getAllParcels(): Observable<Parcel[]> {
    return this.http.get<any>(`${this.apiUrl}`).pipe(
      map(response => {
        // Handle paginated response
        if (response.content) {
          return response.content as Parcel[];
        }
        return response as Parcel[];
      })
    );
  }

  /**
   * Get a single parcel by ID
   */
  getParcelById(id: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get parcel tracking history
   */
  getParcelHistory(id: string): Observable<DeliveryHistory[]> {
    return this.http.get<DeliveryHistory[]>(`${this.apiUrl}/${id}/history`);
  }

  /**
   * Track parcel (with access control)
   */
  trackParcel(id: string): Observable<DeliveryHistory[]> {
    return this.http.get<DeliveryHistory[]>(`${this.apiUrl}/${id}/tracking`);
  }

  /**
   * Create a new parcel (old method with recipientId)
   */
  createParcel(parcel: any): Observable<Parcel> {
    return this.http.post<Parcel>(this.apiUrl, parcel);
  }

  /**
   * Create a new parcel with recipient info inline (for CLIENT)
   * Backend will create the recipient and the parcel in one transaction
   */
  createParcelWithRecipient(parcelData: {
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
  }): Observable<Parcel> {
    return this.http.post<Parcel>(`${this.apiUrl}/with-recipient`, parcelData);
  }

  /**
   * Update parcel
   */
  updateParcel(id: string, parcel: any): Observable<Parcel> {
    return this.http.put<Parcel>(`${this.apiUrl}/${id}`, parcel);
  }

  /**
   * Delete parcel
   */
  deleteParcel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Update parcel status (for LIVREUR role)
   */
  updateParcelStatus(id: string, status: string): Observable<Parcel> {
    return this.http.put<Parcel>(`${this.apiUrl}/${id}/status`, null, {
      params: { status }
    });
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'CREATED': 'bg-gray-500',
      'COLLECTED': 'bg-blue-500',
      'IN_STOCK': 'bg-yellow-500',
      'IN_TRANSIT': 'bg-orange-500',
      'DELIVERED': 'bg-green-500'
    };
    return colors[status] || 'bg-gray-500';
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
      'NORMAL': 'text-gray-600',
      'URGENT': 'text-orange-600',
      'EXPRESS': 'text-red-600'
    };
    return colors[priority] || 'text-gray-600';
  }

  /**
   * Get priority icon for UI
   */
  getPriorityIcon(priority: string): string {
    const icons: { [key: string]: string } = {
      'NORMAL': 'schedule',
      'URGENT': 'schedule_send',
      'EXPRESS': 'bolt'
    };
    return icons[priority] || 'schedule';
  }

  /**
   * Advanced search with pagination (MANAGER only)
   */
  searchParcels(filters: ParcelSearchFilters, pageable: PageableRequest): Observable<PageableResponse<Parcel>> {
    let params = new HttpParams()
      .set('page', pageable.page.toString())
      .set('size', pageable.size.toString());

    if (pageable.sort) {
      params = params.set('sort', pageable.sort);
    }

    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.priority) {
      params = params.set('priority', filters.priority);
    }
    if (filters.zoneId) {
      params = params.set('zoneId', filters.zoneId);
    }
    if (filters.destinationCity) {
      params = params.set('destinationCity', filters.destinationCity);
    }
    if (filters.deliveryPersonId) {
      params = params.set('deliveryPersonId', filters.deliveryPersonId);
    }
    if (filters.senderClientId) {
      params = params.set('senderClientId', filters.senderClientId);
    }
    if (filters.recipientId) {
      params = params.set('recipientId', filters.recipientId);
    }
    if (filters.unassignedOnly !== undefined) {
      params = params.set('unassignedOnly', filters.unassignedOnly.toString());
    }

    return this.http.get<PageableResponse<Parcel>>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get parcels by status
   */
  getParcelsByStatus(status: ParcelStatus): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/status/${status}`);
  }

  /**
   * Get parcels by priority
   */
  getParcelsByPriority(priority: ParcelPriority): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/priority/${priority}`);
  }

  /**
   * Get unassigned parcels
   */
  getUnassignedParcels(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/unassigned`);
  }

  /**
   * Get high priority pending parcels (EXPRESS)
   */
  getHighPriorityPending(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/high-priority-pending`);
  }

  /**
   * Group parcels by status
   */
  groupByStatus(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/group-by/status`);
  }

  /**
   * Group parcels by priority
   */
  groupByPriority(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/group-by/priority`);
  }

  /**
   * Group parcels by zone
   */
  groupByZone(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/group-by/zone`);
  }

  /**
   * Group parcels by city
   */
  groupByCity(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/group-by/city`);
  }

  /**
   * Count parcels by status
   */
  countByStatus(status: ParcelStatus): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/status/${status}/count`);
  }

  /**
   * Count total parcels
   */
  countTotalParcels(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

  /**
   * Get parcels by sender client
   */
  getParcelsBySenderClient(senderClientId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/sender/${senderClientId}`);
  }

  /**
   * Get parcels by recipient
   */
  getParcelsByRecipient(recipientId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/recipient/${recipientId}`);
  }

  /**
   * Get parcels by delivery person
   */
  getParcelsByDeliveryPerson(deliveryPersonId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/delivery-person/${deliveryPersonId}`);
  }

  /**
   * Get parcels by zone
   */
  getParcelsByZone(zoneId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/zone/${zoneId}`);
  }

  /**
   * Get parcels by destination city
   */
  getParcelsByCity(city: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/city/${city}`);
  }
}
