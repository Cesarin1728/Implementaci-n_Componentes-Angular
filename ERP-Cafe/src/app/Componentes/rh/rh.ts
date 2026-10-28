import { Component, computed, signal } from '@angular/core';
import { RhService } from '../../servicios/rh.service';
import { usuarioActual } from '../inicio/inicio'; // Signal del usuario que está

@Component({
  imports: [],
  selector: 'app-rh',
  styleUrl: './rh.css',
  templateUrl: './rh.html',
})
export class Rh {
  busqueda = signal('');
  resultados = signal<any[]>([]);

  administradores = signal<any[]>([]); // Lista de todos los admins

  // Control del modal legal
  modalVisible = signal(false);
  tipoModal = signal<'terminos' | 'privacidad'>('terminos');

  constructor(
    private rhService: RhService
  ) {
    this.cargarAdministradores(); // Cargar al entrar al módulo
  }

  private cargarAdministradores() {
    this.rhService.obtenerAdministradoresBD().subscribe({
      next: (admins) => this.administradores.set(admins),
      error: (e) => console.error('Error al cargar administradores', e)
    });
  }

  usuario = computed(() => usuarioActual()); // Vemos el usuario actual (estos signals están en inicio.ts)

  // le pedimos a rhservice el histirial del adminsitrados logeado
  miHistorial = computed(() => {
    const u = this.usuario();
    return u ? this.rhService.obtenerHistorial(u.id) : [];
  });

  // Cuando se escriba texto en la busqueda, se llama a buscarTrabajador de rhService
  buscar(valor: string) {
    this.busqueda.set(valor);
    if (!valor.trim()) {
      this.resultados.set([]);
      return;
    }
    this.rhService.buscarTrabajadorBD(valor).subscribe({
      next: (r) => this.resultados.set(r),
      error: (e) => console.error('Error al buscar trabajadores', e)
    });
  }

  sinResultados = computed(() => this.busqueda().trim().length > 0 && this.resultados().length === 0);

  // Cuando se haga click en el botón de Registrar llegada, se llama a registrarLlegada de rhService con el id y nombre del usuario
  // Al guardarse en la BD, el trigger evalúa automáticamente si corresponde generar el pago mensual
  registrarLlegada() {
    const u = this.usuario();
    if (!u) return;
    this.rhService.registrarLlegada(u.id, u.nombre);
  }

  // Para registrar la salida del usuario actual, se llama a registrarSalida de rhService con el id del usuario
  registrarSalida() {
    const u = this.usuario();
    if (!u) return;
    this.rhService.registrarSalida(u.id);
  }

  abrirModal(tipo: 'terminos' | 'privacidad') {
    this.tipoModal.set(tipo);
    this.modalVisible.set(true);
  }

  cerrarModal() {
    this.modalVisible.set(false);
  }
}