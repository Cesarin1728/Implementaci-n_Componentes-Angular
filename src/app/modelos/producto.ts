//Modelo de productos
export interface Producto {
    id: number;
    nombre: string;
    stock: number;
    costo_compra: number;
    costo_venta: number;
    costo_inicial: number;
    fecha_inicio: string;
    fecha_fin: string | null;
    disponible: boolean;
    imagen_url: string;
}