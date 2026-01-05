# Core Module

This module contains singleton services, guards, interceptors, and core application logic that should be imported only once in the AppModule.

## Structure:
- **guards/**: Route guards (AuthGuard, RoleGuard)
- **interceptors/**: HTTP interceptors (AuthInterceptor, ErrorInterceptor)
- **services/**: Core singleton services (AuthService, etc.)
- **models/**: Core data models and interfaces