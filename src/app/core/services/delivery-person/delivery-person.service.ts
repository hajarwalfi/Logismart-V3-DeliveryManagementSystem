import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeliveryPerson, DeliveryPersonStats, DeliveryPersonCreate, DeliveryPersonUpdate } from '../../models/delivery-person.model';
import { Parcel } from '../../models/parcel.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeliveryPersonService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/delivery-persons`;

  // ==================== LIVREUR SELF-SERVICE ====================

  /**
   * Get current delivery person's profile (authenticated livreur)
   */
  getMyProfile(): Observable<DeliveryPerson> {
    return this.http.get<DeliveryPerson>(`${this.apiUrl}/me`);
  }

  /**
   * Get current delivery person's statistics (authenticated livreur)
   */
  getMyStats(): Observable<DeliveryPersonStats> {
    return this.http.get<DeliveryPersonStats>(`${this.apiUrl}/me/stats`);
  }

  /**
   * Get current delivery person's delivery history (authenticated livreur)
   */
  getMyDeliveryHistory(): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/me/history`);
  }

  // ==================== MANAGER CRUD ====================

  /**
   * Get all delivery persons (MANAGER only)
   */
  getAll(): Observable<DeliveryPerson[]> {
    return this.http.get<DeliveryPerson[]>(this.apiUrl);
  }

  /**
   * Get delivery person by ID (MANAGER only)
   */
  getById(id: string): Observable<DeliveryPerson> {
    return this.http.get<DeliveryPerson>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new delivery person (MANAGER only)
   */
  create(deliveryPerson: DeliveryPersonCreate): Observable<DeliveryPerson> {
    return this.http.post<DeliveryPerson>(this.apiUrl, deliveryPerson);
  }

  /**
   * Update a delivery person (MANAGER only)
   */
  update(id: string, deliveryPerson: DeliveryPersonUpdate): Observable<DeliveryPerson> {
    return this.http.put<DeliveryPerson>(`${this.apiUrl}/${id}`, deliveryPerson);
  }

  /**
   * Delete a delivery person (MANAGER only)
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // ==================== MANAGER QUERIES ====================

  /**
   * Get delivery persons by zone (MANAGER only)
   */
  getByZone(zoneId: string): Observable<DeliveryPerson[]> {
    return this.http.get<DeliveryPerson[]>(`${this.apiUrl}/zone/${zoneId}`);
  }

  /**
   * Get unassigned delivery persons (MANAGER only)
   */
  getUnassigned(): Observable<DeliveryPerson[]> {
    return this.http.get<DeliveryPerson[]>(`${this.apiUrl}/unassigned`);
  }

  /**
   * Get available delivery persons (MANAGER only)
   */
  getAvailable(): Observable<DeliveryPerson[]> {
    return this.http.get<DeliveryPerson[]>(`${this.apiUrl}/available`);
  }

  /**
   * Get available delivery persons in a specific zone (MANAGER only)
   */
  getAvailableInZone(zoneId: string): Observable<DeliveryPerson[]> {
    return this.http.get<DeliveryPerson[]>(`${this.apiUrl}/available/zone/${zoneId}`);
  }

  /**
   * Count active parcels for a delivery person (MANAGER only)
   */
  countActiveParcels(id: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/parcels/active/count`);
  }

  /**
   * Count delivered parcels for a delivery person (MANAGER only)
   */
  countDeliveredParcels(id: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${id}/parcels/delivered/count`);
  }

  /**
   * Get urgent parcels for a delivery person (MANAGER only)
   */
  getUrgentParcels(id: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/${id}/parcels/urgent`);
  }

  /**
   * Get statistics for a delivery person (MANAGER only)
   */
  getStats(id: string): Observable<DeliveryPersonStats> {
    return this.http.get<DeliveryPersonStats>(`${this.apiUrl}/${id}/stats`);
  }
}
