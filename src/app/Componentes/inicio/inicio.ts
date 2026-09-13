import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  private api = 'http://localhost:3000/api/usuarios';

  constructor(private router: Router, private http: HttpClient) {}

  login(correo: string, pass: string) {
    this.http.post<any>(`${this.api}/login`, { correo, password: pass }).subscribe({

      next: (usuario) => {
        rolActual.set(usuario.rol);
        usuarioActual.set({ id: usuario.id, nombre: usuario.nombre, rol: usuario.rol });

        if (usuario.rol === 'Administrador') {
          this.router.navigate(['/contabilidad']);
        } else {
          this.router.navigate(['/ventas']);
        }
      },

      error: () => {
        alert('Credenciales incorrectas');
      }

    });
  }
}