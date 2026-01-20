import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-oauth2-redirect',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatCardModule],
  templateUrl: './oauth2-redirect.html'
})
export class Oauth2RedirectComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  errorMessage: string | null = null;
  isProcessing = true;

  ngOnInit(): void {
    // Le backend redirige vers cette page après l'authentification OAuth2
    // Il peut passer le token en query param ou en fragment
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      const error = params['error'];

      if (error) {
        this.handleError(error);
        return;
      }

      if (token) {
        this.handleSuccess(token);
        return;
      }

      // Si pas de token ni d'erreur, attendre un peu (le backend peut mettre du temps)
      setTimeout(() => {
        if (this.isProcessing) {
          this.handleError('Aucun token reçu après l\'authentification OAuth2');
        }
      }, 5000);
    });

    // Vérifier aussi dans le fragment (après le #)
    this.route.fragment.subscribe(fragment => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
          this.handleError(error);
          return;
        }

        if (token) {
          this.handleSuccess(token);
          return;
        }
      }
    });
  }

  private handleSuccess(token: string): void {
    this.isProcessing = false;

    // Sauvegarder le token via AuthService
    this.authService.setTokenFromOAuth(token);

    // Rediriger vers le dashboard client
    this.router.navigate(['/client/dashboard']);
  }

  private handleError(error: string): void {
    this.isProcessing = false;
    this.errorMessage = error || 'Une erreur est survenue lors de l\'authentification OAuth2';

    // Rediriger vers login après 3 secondes
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
  }
}
