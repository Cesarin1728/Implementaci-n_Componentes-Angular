//Modelo de productos
export interface Producto {
    id: number;
    nombre: string;
    costoCompra: number;
    costoVenta: number;
    stock: number;
    imagenUrl: string;
}