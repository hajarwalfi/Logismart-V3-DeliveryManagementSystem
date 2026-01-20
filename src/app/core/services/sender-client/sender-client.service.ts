import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SenderClient, SenderClientCreate, SenderClientUpdate } from '../../models/sender-client.model';
import { Parcel } from '../../models/parcel.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SenderClientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sender-clients`;

  /**
   * Get all sender clients
   */
  getAll(): Observable<SenderClient[]> {
    return this.http.get<SenderClient[]>(this.apiUrl);
  }

  /**
   * Get sender client by ID
   */
  getById(id: string): Observable<SenderClient> {
    return this.http.get<SenderClient>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new sender client
   */
  create(client: SenderClientCreate): Observable<SenderClient> {
    return this.http.post<SenderClient>(this.apiUrl, client);
  }

  /**
   * Update a sender client
   */
  update(id: string, client: SenderClientUpdate): Observable<SenderClient> {
    return this.http.put<SenderClient>(`${this.apiUrl}/${id}`, client);
  }

  /**
   * Delete a sender client
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get sender client by email
   */
  getByEmail(email: string): Observable<SenderClient> {
    return this.http.get<SenderClient>(`${this.apiUrl}/by-email/${email}`);
  }

  /**
   * Search sender clients by name
   */
  searchByName(name: string): Observable<SenderClient[]> {
    return this.http.get<SenderClient[]>(`${this.apiUrl}/search`, {
      params: { name }
    });
  }

  /**
   * Count parcels for a sender client
   */
  countParcels(clientId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${clientId}/parcels/count`);
  }

  /**
   * Get in-progress parcels for a sender client
   */
  getInProgressParcels(clientId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/${clientId}/parcels/in-progress`);
  }

  /**
   * Get delivered parcels for a sender client
   */
  getDeliveredParcels(clientId: string): Observable<Parcel[]> {
    return this.http.get<Parcel[]>(`${this.apiUrl}/${clientId}/parcels/delivered`);
  }
}
