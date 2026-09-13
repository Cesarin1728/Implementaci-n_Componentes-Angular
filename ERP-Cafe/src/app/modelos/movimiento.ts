//Modelo de movimiento (para contabilidad)
export interface Movimiento {
    id: number;
    tipo: 'ganancia' | 'gasto';
    concepto: string;
    monto: number;
}