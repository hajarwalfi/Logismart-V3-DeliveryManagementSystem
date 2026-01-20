import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Public home page (no auth required)
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home').then(m => m.HomeComponent),
    pathMatch: 'full'
  },
  {
    path: 'track',
    loadComponent: () =>
      import('./features/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'oauth2/redirect',
    loadComponent: () =>
      import('./features/auth/oauth2-redirect/oauth2-redirect').then(m => m.Oauth2RedirectComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'client',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/client/client-dashboard').then(m => m.ClientDashboardComponent)
      },
      {
        path: 'parcels/create',
        loadComponent: () =>
          import('./features/client/create-parcel/create-parcel').then(m => m.CreateParcelComponent)
      },
      {
        path: 'parcels/:id',
        loadComponent: () =>
          import('./features/client/parcel-details').then(m => m.ParcelDetailsComponent)
      }
    ]
  },
  {
    path: 'livreur',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/livreur/livreur-dashboard').then(m => m.LivreurDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/livreur/livreur-profile').then(m => m.LivreurProfileComponent)
      },
      {
        path: 'parcels/:id',
        loadComponent: () =>
          import('./features/livreur/livreur-parcel-details').then(m => m.LivreurParcelDetailsComponent)
      }
    ]
  },
  {
    path: 'manager',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/manager/manager-dashboard-enhanced').then(m => m.ManagerDashboardEnhancedComponent)
      },
      {
        path: 'parcels',
        loadComponent: () =>
          import('./features/manager/parcel-management').then(m => m.ParcelManagementComponent)
      },
      {
        path: 'delivery-persons',
        loadComponent: () =>
          import('./features/manager/delivery-person-management').then(m => m.DeliveryPersonManagementComponent)
      },
      {
        path: 'zones',
        loadComponent: () =>
          import('./features/manager/zone-management').then(m => m.ZoneManagementComponent)
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/manager/client-management').then(m => m.ClientManagementComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
