import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface UsuarioSesion {
  id: number;
  nombre: string;
  rol: 'Administrador' | 'Cliente';
}

export const rolActual = signal<string | null>(null);
export const usuarioActual = signal<UsuarioSesion | null>(null);

@Component({
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html'
})
export class Inicio {
  usuarios = [
    { id: 1, nombre: 'Cesar Augusto Ramos Cruz', correo: 'admin@cafe.com', pass: '123', rol: 'Administrador' as const },
    { id: 2, nombre: 'Ana Torres Medina', correo: 'ana@cafe.com', pass: '123', rol: 'Administrador' as const },
    { id: 3, nombre: 'Luis Fernández Ibarra', correo: 'luis@cafe.com', pass: '123', rol: 'Administrador' as const },
    { id: 4, nombre: 'Cliente General', correo: 'cliente@cafe.com', pass: '123', rol: 'Cliente' as const },
  ];

  constructor(private router: Router) {}

  login(correo: string, pass: string) {
    const usuarioValido = this.usuarios.find(u => u.correo === correo && u.pass === pass);

    if (usuarioValido) {
      rolActual.set(usuarioValido.rol);
      usuarioActual.set({ id: usuarioValido.id, nombre: usuarioValido.nombre, rol: usuarioValido.rol });

      if (usuarioValido.rol === 'Administrador') {
        this.router.navigate(['/contabilidad']);
      } else {
        this.router.navigate(['/ventas']);
      }
    } else {
      alert('Credenciales incorrectas');
    }
  }
}