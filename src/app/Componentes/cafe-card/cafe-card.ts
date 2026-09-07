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

  mostrarCostoCompra = computed(() => this.modo() === 'compra');
  esInventario = computed(() => this.modo() === 'inventario');

  maximoSeleccionable = computed(() =>
    this.modo() === 'venta' ? this.producto().stock : Infinity
  );

  constructor() {
    effect(() => {
      const producto = this.producto();
      const modo = this.modo();
      this.cantidad.set(modo === 'inventario' ? producto.stock : 0);
    });
  }

  incrementar() {
    if (this.cantidad() < this.maximoSeleccionable()) {
      this.cantidad.update(c => c + 1);
      this.emitirCambio();
    }
  }

  decrementar() {
    if (this.cantidad() > 0) {
      this.cantidad.update(c => c - 1);
      this.emitirCambio();
    }
  }

  reiniciar() {
    this.cantidad.set(this.modo() === 'inventario' ? this.producto().stock : 0);
  }

  confirmarCambioStock() {
    this.stockConfirmado.emit({ producto: this.producto(), nuevaCantidad: this.cantidad() });
  }

  private emitirCambio() {
    this.cantidadChange.emit({ producto: this.producto(), cantidad: this.cantidad() });
  }
}