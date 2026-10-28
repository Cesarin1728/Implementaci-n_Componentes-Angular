import { inject, Inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    //Obtenemos el servicio de autenticación
    const authService = inject(AuthService);
    //Obtenemos el servicio de navegación
    const router = inject(Router);
    //Verificacmos si el usuario tiene una sesión
    if (authService.estaAutenticado()){
        return true; //Permitimos el acceso
    }

    //Si no, lo enviamos a login
    return router.createUrlTree(['/']);
};