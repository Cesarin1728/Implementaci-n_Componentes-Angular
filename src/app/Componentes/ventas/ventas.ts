import { Component, ViewChildren, QueryList } from '@angular/core';
import { CafeCard } from '../cafe-card/cafe-card';
import { ProductoService } from '../../servicios/producto.service';
import { TransaccionService } from '../../servicios/transaccion.service';
import { Producto } from '../../modelos/producto';
import { generarFacturaXML, descargarXML, ConceptoFactura } from '../../utilidades/factura.util';

@Component({
  imports: [CafeCard],
  selector: 'app-ventas',
  styleUrl: './ventas.css',
  templateUrl: './ventas.html',
})
export class Ventas {
  private seleccion = new Map<number, number>();

  @ViewChildren(CafeCard) tarjetas!: QueryList<CafeCard>;

  constructor(
    private productoService: ProductoService,
    private transaccionService: TransaccionService
  ) {}

  get productos() {
    return this.productoService.productos();
  }

  actualizarSeleccion(evento: { producto: Producto; cantidad: number }) {
    if (evento.cantidad > 0) {
      this.seleccion.set(evento.producto.id, evento.cantidad);
    } else {
      this.seleccion.delete(evento.producto.id);
    }
  }

  confirmarCompra() {
    if (this.seleccion.size === 0) {
      alert('Selecciona al menos un café antes de confirmar.');
      return;
    }

    const conceptos: ConceptoFactura[] = [];
    for (const [id, cantidad] of this.seleccion) {
      const producto = this.productoService.obtenerPorId(id);
      if (!producto || cantidad > producto.stock) {
        alert(`No hay existencias suficientes de ${producto?.nombre ?? 'un producto'}.`);
        return;
      }
      conceptos.push({ producto, cantidad });
    }

    for (const { producto, cantidad } of conceptos) {
      this.productoService.restarStock(producto.id, cantidad);
    }

    const total = conceptos.reduce((acc, c) => acc + c.producto.costoVenta * c.cantidad, 0);
    this.transaccionService.registrarGanancia('Venta de café', total);

    const xml = generarFacturaXML(conceptos);
    descargarXML(`factura-${Date.now()}.xml`, xml);

    this.cancelarCompra();
  }

  cancelarCompra() {
    this.seleccion.clear();
    this.tarjetas?.forEach(t => t.reiniciar());
  }
}