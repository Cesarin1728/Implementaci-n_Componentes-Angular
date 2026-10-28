import { Routes } from '@angular/router';
import { Inicio } from './Componentes/inicio/inicio';
import { Ventas } from './Componentes/ventas/ventas';
import { Compras } from './Componentes/compras/compras';
import { Inventario } from './Componentes/inventario/inventario';
import { Contabilidad } from './Componentes/contabilidad/contabilidad';
import { Rh } from './Componentes/rh/rh';
import { Checkout } from './Componentes/checkout/checkout';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

export const routes: Routes = [
    { path: '', component: Inicio },
    { 
        path: 'ventas', 
        component: Ventas,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Administrador', 'Cliente'] }
    },
    { 
        path: 'checkout', 
        component: Checkout,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Administrador', 'Cliente'] }
    },
    { 
        path: 'compras', 
        component: Compras,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Administrador'] }
    },
    { 
        path: 'inventario', 
        component: Inventario,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Administrador'] }
    },
    { 
        path: 'contabilidad', 
        component: Contabilidad,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Administrador'] }
    },
    { 
        path: 'rh', 
        component: Rh,
        canActivate: [authGuard, roleGuard],
        data: { roles: ['Administrador'] }
    },
    { 
        path: '**', 
        redirectTo: '' 
    }
];