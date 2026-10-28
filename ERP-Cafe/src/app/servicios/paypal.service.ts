import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ProductoCarrito, OrdenPaypal, ResultadoPago } from '../modelos/paypal';

@Injectable({
    providedIn: 'root'
    })
    export class PaypalService {
    private http = inject(HttpClient);
    private api = 'http://localhost:3000/api/paypal';

    // Productos que Ventas manda a pagar con PayPal
    carrito = signal<ProductoCarrito[]>([]);

    crearOrden(productos: ProductoCarrito[], cliente_id?: number) {
        return this.http.post<OrdenPaypal>(
        `${this.api}/orden`,
        { productos, cliente_id }
        );
    }

    capturarOrden(orderId: string) {
        return this.http.post<ResultadoPago>(
        `${this.api}/capturar/${orderId}`, 
        {}
        );
    }
}