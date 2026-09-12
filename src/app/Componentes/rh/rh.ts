import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RhService } from '../../servicios/rh.service';
import { TransaccionService } from '../../servicios/transaccion.service';
import { usuarioActual } from '../inicio/inicio'; // Signal del usuario que está

@Component({
  imports: [FormsModule], // Para usar ngModel en el html porque al usar imputs donde en usuario ingresa los datos y no son componentes hijos. No podemos usar standalone (creo)
  selector: 'app-rh',
  styleUrl: './rh.css',
  templateUrl: './rh.html',
})
export class Rh {
  busqueda = signal('');
  montoNomina = signal(1000); // De momento tenemos ese monto, después lo definiremos

  constructor(
    private rhService: RhService,
    private transaccionService: TransaccionService
  ) {}

  usuario = computed(() => usuarioActual()); // Vemos el usuario actual (estos signals están en inicio.ts)

  // le pedimos a rhservice el histirial del adminsitrados logeado
  miHistorial = computed(() => {
    const u = this.usuario();
    return u ? this.rhService.obtenerHistorial(u.id) : [];
  });

  // Cuando se escriba texto en la busqueda, se llama a buscarTrabajador de rhService
  resultadosBusqueda = computed(() => this.rhService.buscarTrabajador(this.busqueda()));
  sinResultados = computed(() => this.busqueda().trim().length > 0 && this.resultadosBusqueda().length === 0);

  // Cuando se haga blibk en el botón de Registrar llegada, se llama a registrarLlegada de rhService con el id y nombre del usuario
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

  pagarNomina() {
    const u = this.usuario();
    if (!u) return;
    const monto = this.montoNomina();
    this.rhService.registrarPagoNomina(u.id, monto); // La registramos en el hisrotial de RH
    this.transaccionService.registrarGasto(`Pago de nómina: ${u.nombre}`, monto); // Lo registramos en contabilidad como gasto
    alert('Pago de nómina registrado y notificado a Contabilidad.');
  }
}