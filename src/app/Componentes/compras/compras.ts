import { Component, ViewChildren, QueryList } from '@angular/core';
import { CafeCard } from '../cafe-card/cafe-card';
import { ProductoService } from '../../servicios/producto.service';
import { TransaccionService } from '../../servicios/transaccion.service';
import { Producto } from '../../modelos/producto';

@Component({
  imports: [CafeCard],
  selector: 'app-compras',
  styleUrl: './compras.css',
  templateUrl: './compras.html',
})
export class Compras {
  private seleccion = new Map<number, number>();

  @ViewChildren(CafeCard) tarjetas!: QueryList<CafeCard>;

  constructor(
    private productoService: ProductoService,
    private transaccionService: TransaccionService
  ) {}

  get productos() {
    return this.productoService.productos();
  }

  // Como en ventas, cuando se activa el evento de CantidadChange, actualizamos la cantidad seleccionada
  actualizarSeleccion(evento: { producto: Producto; cantidad: number }) {
    if (evento.cantidad > 0) {
      this.seleccion.set(evento.producto.id, evento.cantidad);
    } else {
      this.seleccion.delete(evento.producto.id);
    }
  }

  // Al darle al botón de Confirmar
  confirmarCompra() {
    if (this.seleccion.size === 0) { //Vemos que haya algo seleccionado, si no, mostramos un mensaje de alerta
      alert('Selecciona al menos un café para comprar al proveedor.');
      return;
    }
    
    let total = 0;
    for (const [id, cantidad] of this.seleccion) { //No necesitamos validar un stock porque le estamos comprando al proveedor
      const producto = this.productoService.obtenerPorId(id);
      if (producto) {
        total += producto.costoCompra * cantidad; // uUsamos costoCompra, porque es el precio del proveedor
      }
      this.productoService.sumarStock(id, cantidad); // Aumentamos el stock de los productos comprados
    }

    // Registramos el gasto para contabilidad
    this.transaccionService.registrarGasto('Compra de café a proveedor', total);

    alert('Compra a proveedor registrada.');
    this.cancelarCompra();
  }

  cancelarCompra() {
    this.seleccion.clear();
    this.tarjetas?.forEach(t => t.reiniciar());
  }
}