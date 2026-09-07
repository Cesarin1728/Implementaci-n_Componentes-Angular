import { Injectable, signal } from '@angular/core';
import { Transaccion } from '../modelos/transaccion';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
    private _transacciones = signal<Transaccion[]>([]);
    private _siguienteId = 1;

    transacciones = this._transacciones.asReadonly();

    registrarGanancia(concepto: string, monto: number) {
        this.registrar('ganancia', concepto, monto);
    }

    registrarGasto(concepto: string, monto: number) {
        this.registrar('gasto', concepto, monto);
    }

    private registrar(tipo: 'ganancia' | 'gasto', concepto: string, monto: number) {
        const nueva: Transaccion = {
            id: this._siguienteId++,
            fecha: new Date(),
            tipo,
            concepto,
            monto
        };
        this._transacciones.update(lista => [...lista, nueva]);
    }

    obtenerPorRango(inicio: Date, fin: Date): Transaccion[] {
        const finDia = new Date(fin);
        finDia.setHours(23, 59, 59, 999);
        return this._transacciones()
            .filter(t => t.fecha >= inicio && t.fecha <= finDia)
            .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }

    calcularBalance(lista: Transaccion[]): number {
        return lista.reduce((acc, t) => acc + (t.tipo === 'ganancia' ? t.monto : -t.monto), 0);
    }
}