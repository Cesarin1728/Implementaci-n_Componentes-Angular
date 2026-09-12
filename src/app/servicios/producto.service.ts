import { Injectable, signal } from '@angular/core';
import { Producto } from '../modelos/producto';

//URLs de las imagénes de café de ejemplo, para no tener que guardarlas
const IMG_A = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_lTrdyaXSmhinLmhpU8LxFV3pPyqC-MpDRyOtx5MNSg&s=10';
const IMG_B = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6XVTmtgrh6jBZZ9B9UNHNzSk0KLtBB355bCTyUTRubw&s=10';

@Injectable({ providedIn: 'root' })
export class ProductoService {
    //Guardamos un arreglo con los productos (esto en base a la BD, pues después la vamos a utilizar). Cada que se inicia el proyecto se reinician los valores a los de declaración.
    //Se usa signal para que Angular detecte cambios en el arreglo y se actualice la vista automáticamente, con localstorage no funcionó para inicio de sesión, enconces también lo utilicé aquí para más fácil manejarlo en automático.
    private _productos = signal<Producto[]>([
        { id: 1, nombre: 'Café negro',  costoCompra: 15, costoVenta: 20, stock: 25, imagenUrl: IMG_A },
        { id: 2, nombre: 'Expreso',     costoCompra: 15, costoVenta: 20, stock: 25, imagenUrl: IMG_B },
        { id: 3, nombre: 'Capuchino',   costoCompra: 16, costoVenta: 22, stock: 20, imagenUrl: IMG_A },
        { id: 4, nombre: 'Latte',       costoCompra: 16, costoVenta: 22, stock: 20, imagenUrl: IMG_B },
        { id: 5, nombre: 'Americano',   costoCompra: 14, costoVenta: 18, stock: 30, imagenUrl: IMG_A },
        { id: 6, nombre: 'Moka',        costoCompra: 18, costoVenta: 24, stock: 15, imagenUrl: IMG_B },
    ]);

    productos = this._productos.asReadonly();

    //Encontramos el producto por su id, si no lo encuentra devuelve undefined 
    obtenerPorId(id: number): Producto | undefined {
        return this._productos().find(p => p.id === id);
    }

    //Para restar stock, por ejemplo al hacer una venta. Al reiniciar la página no se guardan los cambios
    restarStock(id: number, cantidad: number) {
        this._productos.update(lista => //Buscamos los productos y si coincide el id, le restamos la cantidad, si no, lo dejamos igual
        lista.map(p => p.id === id ? { ...p, stock: p.stock - cantidad } : p)
        );
    }

    sumarStock(id: number, cantidad: number) {
        this._productos.update(lista =>
        lista.map(p => p.id === id ? { ...p, stock: p.stock + cantidad } : p) // Buscamos los productos y si coincide el id, le sumamos la cantidad, si no, lo dejamos igual
        );
    }

    establecerStock(id: number, nuevoStock: number) {
        this._productos.update(lista =>
        // Buscamos los productos y si coincide el id, dejamos el nuevo stock, si no, lo dejamos igual
        lista.map(p => p.id === id ? { ...p, stock: Math.max(0, nuevoStock) } : p)
        );
    }
}