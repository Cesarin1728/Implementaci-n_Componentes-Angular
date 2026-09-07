export interface Transaccion {
    id: number;
    fecha: Date;
    tipo: 'ganancia' | 'gasto';
    concepto: string;
    monto: number;
}