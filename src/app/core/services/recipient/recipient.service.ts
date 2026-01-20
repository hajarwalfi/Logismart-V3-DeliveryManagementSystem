import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipient, RecipientCreate } from '../../models/recipient.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecipientService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/recipients`;

  /**
   * Get all recipients
   */
  getAll(): Observable<Recipient[]> {
    return this.http.get<Recipient[]>(this.apiUrl);
  }

  /**
   * Get recipient by ID
   */
  getById(id: string): Observable<Recipient> {
    return this.http.get<Recipient>(`${this.apiUrl}/${id}`);
  }

  /**
   * Search recipients by name
   */
  search(keyword: string): Observable<Recipient[]> {
    return this.http.get<Recipient[]>(`${this.apiUrl}/search`, {
      params: { keyword }
    });
  }

  /**
   * Create a new recipient
   */
  create(recipient: RecipientCreate): Observable<Recipient> {
    return this.http.post<Recipient>(this.apiUrl, recipient);
  }
}