import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Asistencia } from '../modelos/asistencia';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RhService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private api = 'http://localhost:3000/api/usuarios';

    private _asistencias = signal<Asistencia[]>([]); // Lista de asistencias registradas, no le puse datos para que se registren
    // Para los IDs, de momento es así hasta que hagamos el back
    private _siguienteAsistenciaId = 1;

    asistencias = this._asistencias.asReadonly();

    // Pare registrar una llegada, la llama el administrador al marcar su hora de llegada
    registrarLlegada(administradorId: number, nombreAdministrador: string) {
        // Por si ya se registró la asistencia hoy, no registrarla de nuevo
        const hoy = this.hoy();
        const existente = this._asistencias().find(
            a => a.administradorId === administradorId && a.fecha === hoy
        );
        if (existente) return; // Si ya xiste retorna y no se registra otra vez

        // Para añádir un nuevo elemento a la lista de asistencia en la interfaz
        const nueva: Asistencia = {
            id: this._siguienteAsistenciaId++, 
            administradorId,
            nombreAdministrador,
            fecha: hoy,
            horaLlegada: this.horaActual(),
            horaSalida: null,
        };
        this._asistencias.update(lista => [...lista, nueva]); 

        // Enviamos la llegada a MySQL para que despierte el Trigger de nómina automática
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.authService.obtenerToken()}`
        });

        this.http.post(`${this.api}/llegada`, { administrador_id: administradorId }, { headers }).subscribe({
            next: () => console.log('Llegada guardada en BD. Trigger de nómina evaluado.'),
            error: (err) => console.error('Error al sincronizar llegada con la BD:', err)
        });
    }

    // Se llama cuando el administrador marca su hora de salida
    registrarSalida(administradorId: number) {
        const hoy = this.hoy();
        this._asistencias.update(lista =>
            lista.map(a =>
                // Buscamos el registro del mismo día y administrador
                a.administradorId === administradorId && a.fecha === hoy // Si coincide, actualizamos la hora de salida
                    ? { ...a, horaSalida: this.horaActual() } // Dejamo a los demás como están
                    : a
            )
        );
    }

    buscarTrabajadorBD(termino: string) {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.authService.obtenerToken()}`
        });
        return this.http.get<any[]>(`${this.api}/buscar?termino=${encodeURIComponent(termino)}`, { headers });
    }

    // Para obtener los registros de asistencia de un trabajador, ordenados del más nuevo al más viejo
    obtenerHistorial(administradorId: number): Asistencia[] {
        return this._asistencias()
            .filter(a => a.administradorId === administradorId)
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
    }

    obtenerAdministradoresBD() {
        const headers = new HttpHeaders({
            Authorization: `Bearer ${this.authService.obtenerToken()}`
        });
        return this.http.get<any[]>(`${this.api}/rol/Administrador`, { headers });
    }
    
    // Para que las fechas sean año-mes-día, y que se pueda comparar
    private hoy(): string {
        return new Date().toISOString().slice(0, 10);
    }

    // Para obtener la hora actual en formato HH:MM
    private horaActual(): string {
        return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
}