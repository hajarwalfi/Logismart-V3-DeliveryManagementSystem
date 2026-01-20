import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GlobalStatistics, DeliveryPersonStatistics, ZoneStatistics } from '../../models/statistics.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/statistics`;

  /**
   * Get global system statistics
   */
  getGlobalStatistics(): Observable<GlobalStatistics> {
    return this.http.get<GlobalStatistics>(`${this.apiUrl}/global`);
  }

  /**
   * Get statistics for all delivery persons
   */
  getAllDeliveryPersonStatistics(): Observable<DeliveryPersonStatistics[]> {
    return this.http.get<DeliveryPersonStatistics[]>(`${this.apiUrl}/delivery-person`);
  }

  /**
   * Get statistics for a specific delivery person
   */
  getDeliveryPersonStatistics(id: string): Observable<DeliveryPersonStatistics> {
    return this.http.get<DeliveryPersonStatistics>(`${this.apiUrl}/delivery-person/${id}`);
  }

  /**
   * Get statistics for all zones
   */
  getAllZoneStatistics(): Observable<ZoneStatistics[]> {
    return this.http.get<ZoneStatistics[]>(`${this.apiUrl}/zone`);
  }

  /**
   * Get statistics for a specific zone
   */
  getZoneStatistics(id: string): Observable<ZoneStatistics> {
    return this.http.get<ZoneStatistics>(`${this.apiUrl}/zone/${id}`);
  }
}
