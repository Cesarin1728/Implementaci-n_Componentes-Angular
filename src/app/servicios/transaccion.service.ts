import { Injectable, signal } from '@angular/core';
import { Transaccion } from '../modelos/transaccion';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
    private _transacciones = signal<Transaccion[]>([]); // Iniciamos la lista vacía para ir registrando, ya que hagamos el back lo cargamos de ahí
    private _siguienteId = 1; //Igualmente, hacemos el ID nosotros de momento

    transacciones = this._transacciones.asReadonly();

    // Se llama en los componentes para registrar ganancias en contabilidad
    registrarGanancia(concepto: string, monto: number) {
        this.registrar('ganancia', concepto, monto);
    }

    // Igual que registrarGanancia, pero para gastos
    registrarGasto(concepto: string, monto: number) {
        this.registrar('gasto', concepto, monto);
    }

    // Se llama solamente desde registrarGanancia y registrarGasto, así tenemos solo una función para registrar en contabilidad
    private registrar(tipo: 'ganancia' | 'gasto', concepto: string, monto: number) {
        const nueva: Transaccion = {
            id: this._siguienteId++, // Usamoe el ID actual y no aumentamos
            fecha: new Date(),
            tipo,
            concepto,
            monto
        };
        this._transacciones.update(lista => [...lista, nueva]); // Añadimos la transacción a la lista de transacciones
    }

    // Obtiene las transacciones dentro de un rango de fechas. Quizás lo cambie ya que implemente la BD
    obtenerPorRango(inicio: Date, fin: Date): Transaccion[] {
        const finDia = new Date(fin);
        finDia.setHours(23, 59, 59, 999);
        return this._transacciones()
            .filter(t => t.fecha >= inicio && t.fecha <= finDia)
            .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    }

    // Calcula el balance de una lista de transacciones, sumando las ganancias y restando los gastos
    calcularBalance(lista: Transaccion[]): number { // En base a una lista de transacciones, calculamos el balance, sumando las ganancias y restando los gastos
        return lista.reduce((acc, t) => acc + (t.tipo === 'ganancia' ? t.monto : -t.monto), 0);
    }
}