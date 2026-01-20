import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Zone, ZoneCreate, ZoneUpdate, ZoneStats } from '../../models/zone.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/zones`;

  /**
   * Get all zones
   */
  getAll(): Observable<Zone[]> {
    return this.http.get<Zone[]>(this.apiUrl);
  }

  /**
   * Get zone by ID
   */
  getById(id: string): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new zone
   */
  create(zone: ZoneCreate): Observable<Zone> {
    return this.http.post<Zone>(this.apiUrl, zone);
  }

  /**
   * Update a zone
   */
  update(id: string, zone: ZoneUpdate): Observable<Zone> {
    return this.http.put<Zone>(`${this.apiUrl}/${id}`, zone);
  }

  /**
   * Delete a zone
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search zones by name
   */
  searchByName(name: string): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/search`, {
      params: { name }
    });
  }

  /**
   * Get zone by name
   */
  getByName(name: string): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/by-name/${name}`);
  }

  /**
   * Get zone by postal code
   */
  getByPostalCode(postalCode: string): Observable<Zone> {
    return this.http.get<Zone>(`${this.apiUrl}/by-postal-code/${postalCode}`);
  }

  /**
   * Count delivery persons in zone
   */
  countDeliveryPersons(zoneId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${zoneId}/delivery-persons/count`);
  }

  /**
   * Count parcels in zone
   */
  countParcels(zoneId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${zoneId}/parcels/count`);
  }

  /**
   * Get zone statistics
   */
  getStats(zoneId: string): Observable<ZoneStats> {
    return this.http.get<ZoneStats>(`${this.apiUrl}/${zoneId}/stats`);
  }
}
