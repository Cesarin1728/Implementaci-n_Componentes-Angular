import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Movimiento } from '../../modelos/movimiento';

@Component({
  imports: [FormsModule, DecimalPipe],
  selector: 'app-contabilidad',
  styleUrl: './contabilidad.css',
  templateUrl: './contabilidad.html',
})
export class Contabilidad {
  private api = 'http://localhost:3000/api/transacciones';

  fechaInicio = signal(this.haceDias(30)); // De momento lo dejamos en 30 días
  fechaFin = signal(this.hoy());
  errorRango = signal<string | null>(null); // En caso de que la fecha sea inválida, para mostrar un mensaje de error
  movimientos = signal<Movimiento[]>([]);

  balance = computed(() =>
    this.movimientos().reduce((acc, m) => acc + (m.tipo === 'ganancia' ? m.monto : -m.monto), 0)
  );

  constructor(private http: HttpClient) {
    this.consultar(); // Cargamos el rango inicial (últimos 30 días) al entrar al módulo
  }

  // Se llama cuando el administrador cambia la fecha de inicio
  actualizarInicio(valor: string) {
    this.fechaInicio.set(valor); // actualiza el signal con el valor que puso
    this.validarRango(); // Validamos que el rango de fechas sea correcto
  }

  // Se llama cuando el administrador cambia la fecha de final
  actualizarFin(valor: string) {
    this.fechaFin.set(valor); // actualiza el signal con el valor que puso
    this.validarRango();
  }

  // Le pedimos al backend las transacciones dentro del rango de fechas
  private consultar() {
    if (this.errorRango()) {
      this.movimientos.set([]);
      return;
    }

    const params = `?inicio=${this.fechaInicio()}&fin=${this.fechaFin()}`;

    this.http.get<any[]>(`${this.api}${params}`).subscribe({
      next: (transacciones) => {
        // MySQL devuelve monto como string, aquí lo convertimos a number para poder sumarlo
        this.movimientos.set(transacciones.map(t => ({
          id: t.id,
          tipo: t.tipo,
          concepto: t.concepto,
          monto: Number(t.monto)
        })));
      },
      error: (error) => console.error('Error al consultar transacciones', error)
    });
  }

  // Para validar el rango de fechas
  private validarRango() {
    this.errorRango.set(
      new Date(this.fechaInicio()) > new Date(this.fechaFin()) // Comparamos las fechas, si la fecha de inicio es mayor que la fecha de fin, mostramos un mensaje de error
        ? 'La fecha de inicio no puede ser posterior a la fecha final.'
        : null
    );

    this.consultar(); // Volvemos a consultar con el rango actualizado (o limpiamos si hay error)
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