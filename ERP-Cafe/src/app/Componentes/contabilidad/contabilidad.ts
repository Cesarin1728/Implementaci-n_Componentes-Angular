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
  fechaInicio = signal(this.haceDias(30)); // De momento lo dejamos en 30 días
  fechaFin = signal(this.hoy());
  errorRango = signal<string | null>(null); // En caso de que la fecha sea inválida, para mostrar un mensaje de error

  constructor(private transaccionService: TransaccionService) {}

  movimientos = computed(() => { // Usamos computed para recalcularlo automáticamente cuando cambien las fechas o se agreguen transacciones
    if (this.errorRango()) return []; // Si hay un error en el rango, no mostramos nada
    return this.transaccionService.obtenerPorRango( // Llamamos al servicio de transacciones para obtener las transacciones dentro del rango de fechas
      new Date(this.fechaInicio()),
      new Date(this.fechaFin())
    );
  });

  balance = computed(() => this.transaccionService.calcularBalance(this.movimientos()));

  // Se llama cuando el administrador cambia la fecha de inicio
  actualizarInicio(valor: string) {
    this.fechaInicio.set(valor); // actualiza el signal con el valor que puso
    this.validarRango(); // Validamos que el rango de fechas sea correcto
  }

  // Se llama cuando el administrador cambia la fecha de final
  actualizarFin(valor: string) {
    this.fechaFin.set(valor); // actualiza el signal con el valor que puso
  }

  // Para validar el rango de fechas
  private validarRango() {
    this.errorRango.set(
      new Date(this.fechaInicio()) > new Date(this.fechaFin()) // Comparamos las fechas, si la fecha de inicio es mayor que la fecha de fin, mostramos un mensaje de error
        ? 'La fecha de inicio no puede ser posterior a la fecha final.'
        : null
    );
  }


  // Para obtener la fecha de hoy
  private hoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  // Para obtener la fecha de hace n días
  private haceDias(dias: number): string {
    const d = new Date();
    d.setDate(d.getDate() - dias);
    return d.toISOString().slice(0, 10);
  }
}