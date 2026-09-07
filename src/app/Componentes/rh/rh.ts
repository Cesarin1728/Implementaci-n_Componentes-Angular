import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RhService } from '../../servicios/rh.service';
import { TransaccionService } from '../../servicios/transaccion.service';
import { usuarioActual } from '../inicio/inicio';

@Component({
  imports: [FormsModule],
  selector: 'app-rh',
  styleUrl: './rh.css',
  templateUrl: './rh.html',
})
export class Rh {
  busqueda = signal('');
  montoNomina = signal(1000);

  constructor(
    private rhService: RhService,
    private transaccionService: TransaccionService
  ) {}

  usuario = computed(() => usuarioActual());

  miHistorial = computed(() => {
    const u = this.usuario();
    return u ? this.rhService.obtenerHistorial(u.id) : [];
  });

  resultadosBusqueda = computed(() => this.rhService.buscarTrabajador(this.busqueda()));
  sinResultados = computed(() => this.busqueda().trim().length > 0 && this.resultadosBusqueda().length === 0);

  registrarLlegada() {
    const u = this.usuario();
    if (!u) return;
    this.rhService.registrarLlegada(u.id, u.nombre);
  }

  registrarSalida() {
    const u = this.usuario();
    if (!u) return;
    this.rhService.registrarSalida(u.id);
  }

  pagarNomina() {
    const u = this.usuario();
    if (!u) return;
    const monto = this.montoNomina();
    this.rhService.registrarPagoNomina(u.id, monto);
    this.transaccionService.registrarGasto(`Pago de nómina: ${u.nombre}`, monto);
    alert('Pago de nómina registrado y notificado a Contabilidad.');
  }
}