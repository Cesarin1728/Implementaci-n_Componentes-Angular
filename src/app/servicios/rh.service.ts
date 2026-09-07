import { Injectable, signal } from '@angular/core';
import { Asistencia } from '../modelos/asistencia';
import { Nomina } from '../modelos/nomina';

@Injectable({ providedIn: 'root' })
export class RhService {
    private _asistencias = signal<Asistencia[]>([]);
    private _nominas = signal<Nomina[]>([]);
    private _siguienteAsistenciaId = 1;
    private _siguienteNominaId = 1;

    asistencias = this._asistencias.asReadonly();
    nominas = this._nominas.asReadonly();

    registrarLlegada(administradorId: number, nombreAdministrador: string) {
        const hoy = this.hoy();
        const existente = this._asistencias().find(
            a => a.administradorId === administradorId && a.fecha === hoy
        );
        if (existente) return;

        const nueva: Asistencia = {
            id: this._siguienteAsistenciaId++,
            administradorId,
            nombreAdministrador,
            fecha: hoy,
            horaLlegada: this.horaActual(),
            horaSalida: null,
        };
        this._asistencias.update(lista => [...lista, nueva]);
    }

    registrarSalida(administradorId: number) {
        const hoy = this.hoy();
        this._asistencias.update(lista =>
            lista.map(a =>
                a.administradorId === administradorId && a.fecha === hoy
                    ? { ...a, horaSalida: this.horaActual() }
                    : a
            )
        );
    }

    buscarTrabajador(termino: string): Asistencia[] {
        const t = termino.trim().toLowerCase();
        if (!t) return [];
        return this._asistencias().filter(a =>
            a.nombreAdministrador.toLowerCase().includes(t) ||
            String(a.administradorId).includes(t)
        );
    }

    obtenerHistorial(administradorId: number): Asistencia[] {
        return this._asistencias()
            .filter(a => a.administradorId === administradorId)
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
    }

    registrarPagoNomina(administradorId: number, monto: number) {
        const nueva: Nomina = {
            id: this._siguienteNominaId++,
            administradorId,
            fechaPago: new Date(),
            monto,
        };
        this._nominas.update(lista => [...lista, nueva]);
    }

    private hoy(): string {
        return new Date().toISOString().slice(0, 10);
    }

    private horaActual(): string {
        return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    }
}