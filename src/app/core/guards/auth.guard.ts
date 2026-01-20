import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // isAuthenticated est un signal readonly, pas une fonction
  if (authService.isAuthenticated()) {
    return true;
  }

  // Rediriger vers login si non authentifié
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
