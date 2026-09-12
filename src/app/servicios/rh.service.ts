import { Injectable, signal } from '@angular/core';
import { Asistencia } from '../modelos/asistencia';
import { Nomina } from '../modelos/nomina';

@Injectable({ providedIn: 'root' })
export class RhService {
    private _asistencias = signal<Asistencia[]>([]); // Lista de asistencias registradas, no le puse datos para que se registren
    private _nominas = signal<Nomina[]>([]); // Historial de nominas pagadas
    // Para los IDs, de momento es así hasta que hagamos el back
    private _siguienteAsistenciaId = 1;
    private _siguienteNominaId = 1;

    asistencias = this._asistencias.asReadonly();
    nominas = this._nominas.asReadonly();

    // Pare registrar una llegada, la llama el administrador al marcar su hora de llegada
    registrarLlegada(administradorId: number, nombreAdministrador: string) {
        // Por si ya se registró la asistencia hoy, no registrarla de nuevo
        const hoy = this.hoy();
        const existente = this._asistencias().find(
            a => a.administradorId === administradorId && a.fecha === hoy
        );
        if (existente) return; // Si ya xiste retorna y no se registra otra vez

        // Para añádir un nuevo elemento a la lista de asistencia, ya que pongamos el back será directo en la tabla
        const nueva: Asistencia = {
            id: this._siguienteAsistenciaId++, // Como no hay BD ni nada, aumentamos el ID
            administradorId,
            nombreAdministrador,
            fecha: hoy,
            horaLlegada: this.horaActual(),
            horaSalida: null,
        };
        this._asistencias.update(lista => [...lista, nueva]); 
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

    // Cuando se hace la busqueda de un trabajador en la barra de busqueda
    buscarTrabajador(termino: string): Asistencia[] {
        const t = termino.trim().toLowerCase(); // Normalizamos el texto para que no afecten los espacios o mayúsculas
        if (!t) return []; // Si no hay nada escrito, retorna
        // Filtramos los registros por nombre o ID del administrador, y devolvemos los que coincidan
        return this._asistencias().filter(a =>
            a.nombreAdministrador.toLowerCase().includes(t) ||
            String(a.administradorId).includes(t)
        );
    }

    // Para obtener los registros de asistencia de un trabajador, ordenados del más nuevo al más viejo
    obtenerHistorial(administradorId: number): Asistencia[] {
        return this._asistencias()
            .filter(a => a.administradorId === administradorId)
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
    }

    // Para registrar el pago de la nómina 
    registrarPagoNomina(administradorId: number, monto: number) {
        const nueva: Nomina = {
            id: this._siguienteNominaId++,
            administradorId,
            fechaPago: new Date(),
            monto,
        };
        this._nominas.update(lista => [...lista, nueva]);
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