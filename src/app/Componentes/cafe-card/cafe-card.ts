import { Component, input, output, signal, computed, effect } from '@angular/core';
import { Producto } from '../../modelos/producto';

@Component({
  imports: [],
  selector: 'app-cafe-card',
  styleUrl: './cafe-card.css',
  templateUrl: './cafe-card.html',
})
export class CafeCard {
  producto = input.required<Producto>();
  modo = input<'inventario' | 'venta' | 'compra'>('inventario');

  cantidadChange = output<{ producto: Producto; cantidad: number }>();
  stockConfirmado = output<{ producto: Producto; nuevaCantidad: number }>();

  cantidad = signal(0);

  // true si el modo es de compra, para mostrar el costo de compra en la tarjeta (solo se necesita aquí)
  mostrarCostoCompra = computed(() => this.modo() === 'compra');
  // igual que el anterior, pero para inventario, para mostrar el botón de confirmar cambios y ocultar disponibles
  esInventario = computed(() => this.modo() === 'inventario');

  // Ponemos un límite para seleccionar con el stock disponible en modo venta, si es otro modo no hay límite
  maximoSeleccionable = computed(() =>
    this.modo() === 'venta' ? this.producto().stock : Infinity
  );

  constructor() {
    effect(() => { //se ejecuta cuando cambian las señales de producto o modo, para sincronizar los valores
      const producto = this.producto();
      const modo = this.modo();

      // Si es modo es inventario la cantidad es la del stock, si es otro modo la cantidad es 0
      this.cantidad.set(modo === 'inventario' ? producto.stock : 0);
    });
  }

  // Al darle al botón de +
  incrementar() {
    if (this.cantidad() < this.maximoSeleccionable()) { // Solo incrementamos si no se pasa del stock disponible
      this.cantidad.update(c => c + 1);
      this.emitirCambio();
    }
  }

  decrementar() {
    if (this.cantidad() > 0) {
      this.cantidad.update(c => c - 1); // Para que no puedan ser negativos.
      this.emitirCambio();
    }
  }

  reiniciar() { // Después de una compra o venta, reiniciamos la cantidad a 0 o al stock disponible si es modo inventario
    this.cantidad.set(this.modo() === 'inventario' ? this.producto().stock : 0);
  }

  confirmarCambioStock() { // Para el modo inventario, cuando se confirma el cambio de stock
    this.stockConfirmado.emit({ producto: this.producto(), nuevaCantidad: this.cantidad() });
  }

  private emitirCambio() { // Para incrementar o decrementar, se uda en los metodos incrementar y decrementar
    this.cantidadChange.emit({ producto: this.producto(), cantidad: this.cantidad() });
  }
}