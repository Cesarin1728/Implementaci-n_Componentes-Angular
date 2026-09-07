import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { TransaccionService } from '../../servicios/transaccion.service';

@Component({
  imports: [FormsModule, DecimalPipe],
  selector: 'app-contabilidad',
  styleUrl: './contabilidad.css',
  templateUrl: './contabilidad.html',
})
export class Contabilidad {
  fechaInicio = signal(this.haceDias(30));
  fechaFin = signal(this.hoy());
  errorRango = signal<string | null>(null);

  constructor(private transaccionService: TransaccionService) {}

  movimientos = computed(() => {
    if (this.errorRango()) return [];
    return this.transaccionService.obtenerPorRango(
      new Date(this.fechaInicio()),
      new Date(this.fechaFin())
    );
  });

  balance = computed(() => this.transaccionService.calcularBalance(this.movimientos()));

  actualizarInicio(valor: string) {
    this.fechaInicio.set(valor);
    this.validarRango();
  }

  actualizarFin(valor: string) {
    this.fechaFin.set(valor);
    this.validarRango();
  }

  private validarRango() {
    this.errorRango.set(
      new Date(this.fechaInicio()) > new Date(this.fechaFin())
        ? 'La fecha de inicio no puede ser posterior a la fecha final.'
        : null
    );
  }

  private hoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private haceDias(dias: number): string {
    const d = new Date();
    d.setDate(d.getDate() - dias);
    return d.toISOString().slice(0, 10);
  }
}