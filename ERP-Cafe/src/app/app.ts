import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './Componentes/navbar/navbar';
import { AuthService } from './servicios/auth.service';
import { rolActual, usuarioActual } from './Componentes/inicio/inicio';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ERP-Cafe');

  constructor(private authService: AuthService) {
    if (this.authService.estaAutenticado()) {
      const rol = this.authService.obtenerRol();
      rolActual.set(rol);
      usuarioActual.set({
        id: this.authService.obtenerId(),
        nombre: this.authService.obtenerNombre() || '',
        rol: (rol as any) || 'Cliente'
      });
    }
  }
}