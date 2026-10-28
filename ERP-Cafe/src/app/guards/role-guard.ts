import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject, Inject } from '@angular/core';
import { AuthService } from '../servicios/auth.service';

export const roleGuard: CanActivateFn = (
    route: ActivatedRouteSnapshot) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        // Obtenemos los roles permitidos en la ruta. Del data de app.routes.ts
        const rolesPermitidos: string[] = route.data['roles'] ?? [];

        // Verificar que exista una sesion
        if (!authService.estaAutenticado()) {
        return router.createUrlTree(['/']);
        }

        // Verificar si el usuario tiene permisos
        if (authService.tieneRol(rolesPermitidos)) {
        return true; // Permitimos el acceso
        }

        // Si no tiene acceso a esta ruta, lo redirigimos a su vista según su rol
        const rol = authService.obtenerRol();
        if (rol === 'Administrador') {
        return router.createUrlTree(['/contabilidad']);
        }

        return router.createUrlTree(['/ventas']);
};