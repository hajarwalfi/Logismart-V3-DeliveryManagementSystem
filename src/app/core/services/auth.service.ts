import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, RegisterRequest, User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly API_URL = 'http://localhost:8080';
  private readonly TOKEN_KEY = 'auth_token';

  // Signal pour l'état d'authentification
  private readonly isAuthenticatedSignal = signal<boolean>(this.hasToken());
  private readonly currentUserSignal = signal<User | null>(null);

  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();
  readonly currentUser = this.currentUserSignal.asReadonly();

  // Computed signal for user role
  readonly userRole = computed(() => {
    const user = this.currentUserSignal();
    return user?.role || this.getRoleFromToken();
  });

  constructor() {
    // Vérifier si l'utilisateur est déjà connecté au démarrage
    if (this.hasToken()) {
      this.loadCurrentUser();
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`,
      credentials)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.isAuthenticatedSignal.set(true);
          // Normalize role (remove ROLE_ prefix if present)
          const normalizedRole = this.normalizeRole(response.role);
          // Set user from response immediately (role is included)
          this.currentUserSignal.set({
            id: '',
            username: response.username,
            email: '',
            role: normalizedRole
          });
        })
      );
  }

  register(registerData: RegisterRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/register`,
      registerData)
      .pipe(
        tap(response => {
          this.setToken(response.token);
          this.isAuthenticatedSignal.set(true);
          // Normalize role (remove ROLE_ prefix if present)
          const normalizedRole = this.normalizeRole(response.role);
          // Set user from response immediately (role is included)
          this.currentUserSignal.set({
            id: '',
            username: response.username,
            email: '',
            role: normalizedRole
          });
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isAuthenticatedSignal.set(false);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private loadCurrentUser(): void {
    const token = this.getToken();
    if (token) {
      const payload = this.decodeToken(token);
      if (payload) {
        const role = payload.role || this.extractRoleFromAuthorities(payload.authorities);
        this.currentUserSignal.set({
          id: payload.sub,
          username: payload.sub,
          email: payload.email || '',
          role: this.normalizeRole(role)
        });
      }
    }
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  private getRoleFromToken(): string | null {
    const token = this.getToken();
    if (!token) return null;

    const payload = this.decodeToken(token);
    if (!payload) return null;

    return payload.role || this.extractRoleFromAuthorities(payload.authorities);
  }

  private extractRoleFromAuthorities(authorities: any[]): string | null {
    if (!authorities || !Array.isArray(authorities)) return null;

    // Look for ROLE_ prefixed authority
    const roleAuth = authorities.find((a: any) =>
      (typeof a === 'string' && a.startsWith('ROLE_')) ||
      (a.authority && a.authority.startsWith('ROLE_'))
    );

    if (roleAuth) {
      const role = typeof roleAuth === 'string' ? roleAuth : roleAuth.authority;
      return role.replace('ROLE_', '');
    }
    return null;
  }

  /**
   * Normalize role by removing ROLE_ prefix if present
   */
  private normalizeRole(role: string | null | undefined): string {
    if (!role) return '';
    return role.replace('ROLE_', '');
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.userRole();
    return userRole === role || userRole === `ROLE_${role}`;
  }

  /**
   * Get the appropriate dashboard route based on user role
   */
  getDashboardRoute(): string {
    const role = this.userRole();
    switch (role) {
      case 'CLIENT':
        return '/client/dashboard';
      case 'LIVREUR':
        return '/livreur/dashboard';
      case 'MANAGER':
        return '/manager/dashboard';
      default:
        return '/dashboard';
    }
  }

  /**
   * Méthode pour définir le token depuis OAuth2 redirect
   * @param token JWT token reçu après OAuth2
   */
  setTokenFromOAuth(token: string): void {
    this.setToken(token);
    this.isAuthenticatedSignal.set(true);
    this.loadCurrentUser();
  }
}
