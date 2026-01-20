import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DeliveryHistoryResponse, DeliveryHistoryCreate } from '../../models/delivery-history.model';

@Injectable({
  providedIn: 'root'
})
export class DeliveryHistoryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/delivery-history`;

  /**
   * Create a new delivery history entry
   */
  create(dto: DeliveryHistoryCreate): Observable<DeliveryHistoryResponse> {
    return this.http.post<DeliveryHistoryResponse>(this.apiUrl, dto);
  }

  /**
   * Get delivery history entry by ID
   */
  findById(id: string): Observable<DeliveryHistoryResponse> {
    return this.http.get<DeliveryHistoryResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get all delivery history entries
   */
  findAll(): Observable<DeliveryHistoryResponse[]> {
    return this.http.get<DeliveryHistoryResponse[]>(this.apiUrl);
  }

  /**
   * Get history timeline for a specific parcel
   */
  findByParcelId(parcelId: string): Observable<DeliveryHistoryResponse[]> {
    return this.http.get<DeliveryHistoryResponse[]>(`${this.apiUrl}/parcel/${parcelId}`);
  }

  /**
   * Get latest history entry for a parcel
   */
  findLatestByParcelId(parcelId: string): Observable<DeliveryHistoryResponse> {
    return this.http.get<DeliveryHistoryResponse>(`${this.apiUrl}/parcel/${parcelId}/latest`);
  }

  /**
   * Delete a delivery history entry
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Count history entries for a parcel
   */
  countByParcelId(parcelId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/parcel/${parcelId}/count`);
  }

  /**
   * Get history entries with comments
   */
  findEntriesWithComments(): Observable<DeliveryHistoryResponse[]> {
    return this.http.get<DeliveryHistoryResponse[]>(`${this.apiUrl}/with-comments`);
  }

  /**
   * Count deliveries completed today
   */
  countDeliveriesToday(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/deliveries/today/count`);
  }

  /**
   * Get my delivery history (for delivery person)
   */
  getMyHistory(): Observable<DeliveryHistoryResponse[]> {
    return this.http.get<DeliveryHistoryResponse[]>(`${this.apiUrl}/my-history`);
  }
}
