import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { rolActual, usuarioActual } from '../inicio/inicio';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  private authService = inject(AuthService);
  private router = inject(Router);

  rol = this.authService.rolActual;

  cerrarSesion() {
    this.authService.cerrarSesion();

    rolActual.set(null);
    usuarioActual.set(null);

    this.router.navigate(['/']);
  }
}