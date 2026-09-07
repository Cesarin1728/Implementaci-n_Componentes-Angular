import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { rolActual, usuarioActual } from '../inicio/inicio';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-navbar',
  styleUrl: './navbar.css',
  templateUrl: './navbar.html',
})
export class Navbar {
  rol = rolActual;

  constructor(private router: Router) {}

  cerrarSesion() {
    rolActual.set(null);
    usuarioActual.set(null);
    this.router.navigate(['/']);
  }
}