import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../modelos/producto';

@Injectable({ providedIn: 'root' })
export class ProductoService {

    //Antes aquí estaba un arreglo con productos de ejemplo, pero con la BD ya no es necesario. Los datos no se reinician al reiniciar la página porque están ahora en la BD.
    private api = 'http://localhost:3000/api/productos';

    // Guardamos un arreglo con los productos que ahora viene de la BD, sigue como signal para que los componentes se actualicen solos
    private _productos = signal<Producto[]>([]);

    productos = this._productos.asReadonly();

    constructor(private http: HttpClient) {
        this.cargarProductos();
    }

    // Pide la lista completa de productos al backend y llena el signal
    cargarProductos() {
        this.http.get<Producto[]>(this.api).subscribe({
            next: (productos) => this._productos.set(productos.map(p => this.normalizar(p))),
            error: (error) => console.error('Error al cargar productos', error)
        });
    }

    // MySQL devuelve las columnas DECIMAL (costo_compra, costo_venta, costo_inicial) como strings, aquí las convertimos a number para que funcionen los cálculos y .toFixed() en ventas, compras y factura. No había pensado, hasta que en el navegador me mandaba error en la consola
    private normalizar(p: Producto): Producto {
        return {
            ...p,
            costo_compra: Number(p.costo_compra),
            costo_venta: Number(p.costo_venta),
            costo_inicial: Number(p.costo_inicial)
        };
    }

    // Encontramos el producto por su id, si no lo encuentra devuelve undefined
    obtenerPorId(id: number): Producto | undefined {
        return this._productos().find(p => p.id === id);
    }

    // Para restar stock, por ejemplo al hacer una venta. Ahora también actualiza la BD
    restarStock(id: number, cantidad: number) {
        this.http.put(`${this.api}/${id}/restar-stock`, { cantidad }).subscribe({
            next: () => this.cargarProductos(), // Recargamos para ver el stock real desde la BD
            error: (error) => console.error('Error al restar stock', error)
        });
    }

    sumarStock(id: number, cantidad: number) {
        this.http.put(`${this.api}/${id}/sumar-stock`, { cantidad }).subscribe({
            next: () => this.cargarProductos(),
            error: (error) => console.error('Error al sumar stock', error)
        });
    }

    establecerStock(id: number, nuevoStock: number) {
        this.http.put(`${this.api}/${id}/stock`, { nuevoStock }).subscribe({
            next: () => this.cargarProductos(),
            error: (error) => console.error('Error al establecer stock', error)
        });
    }
}