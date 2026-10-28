import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Transaccion } from '../modelos/transaccion';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TransaccionService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private api = 'http://localhost:3000/api/transacciones';

    private _transacciones = signal<Transaccion[]>([]); // Cargamos las transacciones desde la BD
    private _siguienteId = 1; // ID de respaldo para registros locales

    transacciones = this._transacciones.asReadonly();

    constructor() {
        this.cargarTransacciones(); // Cargamos las transacciones desde el backend al iniciar el servicio
    }

    // Consulta las transacciones directamente de la base de datos (donde el trigger ya insertó el gasto)
    cargarTransacciones() {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.authService.obtenerToken()}`
        });

        this.http.get<any[]>(this.api, { headers }).subscribe({
            next: (datos) => {
                const mapeadas: Transaccion[] = datos.map(t => ({
                    id: t.id,
                    fecha: new Date(t.fecha),
                    tipo: t.tipo,
                    concepto: t.concepto,
                    monto: Number(t.monto)
                }));
                this._transacciones.set(mapeadas);
            },
            error: (e) => console.error('Error al cargar transacciones desde la BD', e)
        });
    }

    // Se llama en los componentes para registrar ganancias en contabilidad
    registrarGanancia(concepto: string, monto: number) {
        this.registrar('ganancia', concepto, monto);
    }

    // Igual que registrarGanancia, pero para gastos
    registrarGasto(concepto: string, monto: number) {
        this.registrar('gasto', concepto, monto);
    }

    // Se llama solamente desde registrarGanancia y registrarGasto
    private registrar(tipo: 'ganancia' | 'gasto', concepto: string, monto: number) {
        const cuerpo = {
            tipo,
            concepto,
            monto,
            origen_tipo: tipo === 'gasto' ? 'nomina' : 'venta'
        };

        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.authService.obtenerToken()}`
        });

        this.http.post<any>(this.api, cuerpo, { headers }).subscribe({
            next: (res) => {
                const nueva: Transaccion = {
                    id: res.id || this._siguienteId++,
                    fecha: new Date(),
                    tipo,
                    concepto,
                    monto
                };
                this._transacciones.update(lista => [...lista, nueva]); // Añadimos la transacción a la lista
            },
            error: (err) => {
                console.error('Error al registrar la transacción en la BD:', err);
                const nueva: Transaccion = {
                    id: this._siguienteId++,
                    fecha: new Date(),
                    tipo,
                    concepto,
                    monto
                };
                this._transacciones.update(lista => [...lista, nueva]);
            }
        });
    }

    // Obtiene las transacciones dentro de un rango de fechas
    obtenerPorRango(inicio: Date, fin: Date): Transaccion[] {
        const ini = new Date(inicio);
        ini.setHours(0, 0, 0, 0);
        const finDia = new Date(fin);
        finDia.setHours(23, 59, 59, 999);
        return this._transacciones()
            .filter(t => {
                const f = new Date(t.fecha);
                return f >= ini && f <= finDia;
            })
            .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }

    // Calcula el balance de una lista de transacciones, sumando las ganancias y restando los gastos
    calcularBalance(lista: Transaccion[]): number { // En base a una lista de transacciones, calculamos el balance, sumando las ganancias y restando los gastos
        return lista.reduce((acc, t) => acc + (t.tipo === 'ganancia' ? t.monto : -t.monto), 0);
    }
}