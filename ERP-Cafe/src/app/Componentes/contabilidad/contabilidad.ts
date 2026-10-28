import { Component, signal, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Movimiento } from '../../modelos/movimiento';
import { AuthService } from '../../servicios/auth.service';

@Component({
  imports: [DecimalPipe],
  selector: 'app-contabilidad',
  styleUrl: './contabilidad.css',
  templateUrl: './contabilidad.html',
})
export class Contabilidad {
  private api = 'http://localhost:3000/api/transacciones';
  private authService = inject(AuthService);

  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');
  errorRango = signal<string | null>(null); // En caso de que la fecha sea inválida, para mostrar un mensaje de error
  movimientos = signal<Movimiento[]>([]);

  balance = computed(() =>
    this.movimientos().reduce((acc, m) => acc + (m.tipo === 'ganancia' ? m.monto : -m.monto), 0)
  );

  constructor(private http: HttpClient) {}

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
    if (this.errorRango() || !this.fechaInicio() || !this.fechaFin()) {
      this.movimientos.set([]);
      return;
    }

    const token = this.authService.obtenerToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const params = `?inicio=${this.fechaInicio()}&fin=${this.fechaFin()}`;

    this.http.get<any[]>(`${this.api}${params}`, { headers }).subscribe({
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
    if (this.fechaInicio() && this.fechaFin()) {
      this.errorRango.set(
        new Date(this.fechaInicio()) > new Date(this.fechaFin()) // Comparamos las fechas, si la fecha de inicio es mayor que la fecha de fin, mostramos un mensaje de error
          ? 'La fecha de inicio no puede ser posterior a la fecha final.'
          : null
      );
    } else {
      this.errorRango.set(null);
    }

    this.consultar(); // Volvemos a consultar con el rango actualizado (o limpiamos si hay error)
  }
}