import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

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
  // Control reactivo del modal legal
  modalVisible = signal(false);
  tipoModal = signal<'terminos' | 'privacidad'>('terminos');

  constructor(private router: Router, private authService: AuthService) {
    if (this.authService.estaAutenticado()) {
      const rol = this.authService.obtenerRol();
      rolActual.set(rol);
      usuarioActual.set({
        id: this.authService.obtenerId(),
        nombre: this.authService.obtenerNombre() || '',
        rol: (rol as any) || 'Cliente'
      });

      if (rol === 'Administrador') {
        this.router.navigate(['/contabilidad']);
      } else {
        this.router.navigate(['/ventas']);
      }
    }
  }

  abrirModal(tipo: 'terminos' | 'privacidad') {
    this.tipoModal.set(tipo);
    this.modalVisible.set(true);
  }

  cerrarModal() {
    this.modalVisible.set(false);
  }

  login(correo: string, pass: string) {
    const usuario = {
      correo: correo,
      contrasena: pass
    };

    this.authService.login(usuario).subscribe({
      next: (respuesta) => {
        this.authService.guardarToken(respuesta.token, respuesta.rol, respuesta.nombre, respuesta.correo, respuesta.id);
        
        rolActual.set(respuesta.rol);
        usuarioActual.set({
          id: respuesta.id || 0,
          nombre: respuesta.nombre,
          rol: respuesta.rol as any
        });

        if (respuesta.rol === 'Administrador') {
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