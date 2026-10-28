import { Component, ViewChildren, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { CafeCard } from '../cafe-card/cafe-card';
import { ProductoService } from '../../servicios/producto.service';
import { PaypalService } from '../../servicios/paypal.service';
import { Producto } from '../../modelos/producto';

@Component({
  imports: [CafeCard],
  selector: 'app-ventas',
  styleUrl: './ventas.css',
  templateUrl: './ventas.html',
})
export class Ventas {
  // Guardamos el producto y la cantidad que quiere comprar
  private seleccion = new Map<number, number>();

  @ViewChildren(CafeCard) tarjetas!: QueryList<CafeCard>;
  // Referencia a las tarjetas de café

  constructor(
    private productoService: ProductoService,
    private paypalService: PaypalService,
    private router: Router
  ) {}

  // Leemos el signal de los productos
  get productos() {
    return this.productoService.productos();
  }

  // Cuando se activa el evento de CantidadChange, actualizamos la cantidad seleccionada
  actualizarSeleccion(evento: { producto: Producto; cantidad: number }) {
    if (evento.cantidad > 0) {
      this.seleccion.set(evento.producto.id, evento.cantidad);
    } else {
      this.seleccion.delete(evento.producto.id);
    }
  }

  confirmarCompra() { // Al hacer click en Comprar, el pago se hace con PayPal
    if (this.seleccion.size === 0) { // Que haya al menos un café seleccionado
      alert('Selecciona al menos un café antes de confirmar.');
      return;
    }

    // Validamos el stock disponible
    for (const [id, cantidad] of this.seleccion) {
      const producto = this.productoService.obtenerPorId(id);
      if (!producto || cantidad > producto.stock) {
        alert(`No hay existencias suficientes de ${producto?.nombre ?? 'un producto'}.`);
        return;
      }
    }

    // Mandamos los productos seleccionados a la pantalla de checkout
    this.paypalService.carrito.set(
      Array.from(this.seleccion, ([id, cantidad]) => ({ id, cantidad }))
    );
    this.router.navigate(['/checkout']);
  }

  // Al dar en cancelar
  cancelarCompra() {
    this.seleccion.clear();
    this.tarjetas?.forEach(t => t.reiniciar());
  }
}