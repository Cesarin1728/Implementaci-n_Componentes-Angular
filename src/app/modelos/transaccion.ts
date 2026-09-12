//Modelo de transacciones
export interface Transaccion {
    id: number;
    fecha: Date;
    tipo: 'ganancia' | 'gasto'; //Solo puede ser una ganancia o gasto
    concepto: string;
    monto: number;
}