import { Routes } from '@angular/router';
import { Inicio } from './Componentes/inicio/inicio';
import { Ventas } from './Componentes/ventas/ventas';
import { Compras } from './Componentes/compras/compras';
import { Inventario } from './Componentes/inventario/inventario';
import { Contabilidad } from './Componentes/contabilidad/contabilidad';
import { Rh } from './Componentes/rh/rh';

export const routes: Routes = [
    { path: '', component: Inicio },
    { path: 'ventas', component: Ventas },
    { path: 'compras', component: Compras },
    { path: 'inventario', component: Inventario },
    { path: 'contabilidad', component: Contabilidad },
    { path: 'rh', component: Rh },
];