export interface ProductoCarrito {
    id: number;
    cantidad: number;
}

export interface OrdenPaypal {
    id: string;
    total: string;
}

export interface ResultadoPago {
    mensaje: string;
    orderId: string;
    captureId: string;
    estado: string;
}