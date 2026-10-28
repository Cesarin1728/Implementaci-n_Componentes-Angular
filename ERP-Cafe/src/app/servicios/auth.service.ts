import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Credenciales } from '../modelos/credenciales';
import { RespuestaLogin } from '../modelos/respuesta-login';
import { Perfil } from '../modelos/perfil';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private url = 'http://localhost:3000/api'; // Dirección del back

    // Signal reactivo para sincronizar el Navbar en tiempo real
    private _rolActual = signal<string | null>(null);
    rolActual = this._rolActual.asReadonly();

    constructor(private http: HttpClient) {
        if (typeof window !== 'undefined' && window.localStorage) {
            this._rolActual.set(localStorage.getItem('rol'));
        }
    }

    // Enviar las credenciales al backend y recibir la respuesta
    login(usuario: Credenciales): Observable<RespuestaLogin> {
        return this.http.post<RespuestaLogin>(`${this.url}/login`, usuario);
    }

    guardarToken(token: string, rol: string, nombre: string, correo: string, id?: number) {
        if (typeof window === 'undefined' || !window.localStorage) return;

        localStorage.setItem('token', token);
        localStorage.setItem('rol', rol);
        localStorage.setItem('nombre', nombre);
        localStorage.setItem('correo', correo);
        if (id !== undefined) {
            localStorage.setItem('id', String(id));
        }

        this._rolActual.set(rol); 
    }

    obtenerToken(): string | null {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return localStorage.getItem('token');
    }

    estaAutenticado(): boolean {
        return this.obtenerToken() !== null;
    }

    cerrarSesion() {
        if (typeof window !== 'undefined' && window.localStorage) {
            // Elimina el token, rol y credenciales de sesión
            localStorage.removeItem('token');
            localStorage.removeItem('rol');
            localStorage.removeItem('nombre');
            localStorage.removeItem('correo');
            localStorage.removeItem('id');
        }

        this._rolActual.set(null);
    }

    obtenerRol(): string | null {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return localStorage.getItem('rol');
    }

    obtenerNombre(): string | null {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return localStorage.getItem('nombre');
    }

    obtenerCorreo(): string | null {
        if (typeof window === 'undefined' || !window.localStorage) return null;
        return localStorage.getItem('correo');
    }

    obtenerId(): number {
        if (typeof window === 'undefined' || !window.localStorage) return 0;
        return Number(localStorage.getItem('id')) || 0;
    }

    // Consultar la ruta protegida enviando el token
    obtenerPerfil(): Observable<Perfil> {
        return this.http.get<Perfil>(`${this.url}/perfil`, {
            headers: { Authorization: `Bearer ${this.obtenerToken()}` }
        });
    }

    tieneRol(rolesPermitidos: string[]): boolean {
        const rol = this.obtenerRol();
        return rol !== null && rolesPermitidos.includes(rol);
    }
}