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
  // Guardamos el producto y la cantidad que quiere comprar
  private seleccion = new Map<number, number>();

  @ViewChildren(CafeCard) tarjetas!: QueryList<CafeCard>;
  // Referencia a las tarjetas de café

  constructor(
    private productoService: ProductoService, // Inyectamos los servicios, ccmo con hexagonal
    private transaccionService: TransaccionService
  ) {}

  // Leemos el siganal de los productos
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

  confirmarCompra() { // Al hacer click en Comprar
    if (this.seleccion.size === 0) { // Que haya al menos un café seleccionado
      alert('Selecciona al menos un café antes de confirmar.');
      return;
    }

    // Vamos acumulando los conceptos de la factura, y verificamos que haya stock suficiente
    const conceptos: ConceptoFactura[] = [];
    for (const [id, cantidad] of this.seleccion) {
      const producto = this.productoService.obtenerPorId(id);
      if (!producto || cantidad > producto.stock) {
        alert(`No hay existencias suficientes de ${producto?.nombre ?? 'un producto'}.`);
        return;
      }
      conceptos.push({ producto, cantidad });
    }

    // Llamamos al servicio de producto para restar el stock de cada producto vendido
    for (const { producto, cantidad } of conceptos) {
      this.productoService.restarStock(producto.id, cantidad);
    }

    // Calculamos el total de la venta y lo registramos en la transacción
    const total = conceptos.reduce((acc, c) => acc + c.producto.costo_venta * c.cantidad, 0);
    this.transaccionService.registrarGanancia('Venta de café', total);

    // Generamos la factura en el XML
    const xml = generarFacturaXML(conceptos);
    descargarXML(`factura-${Date.now()}.xml`, xml); // Para descargar el XML

    // Reinicia las tarjetas y limpia la selección
    this.cancelarCompra();
  }

  //Al final de una compra o al dar en cancelar
  cancelarCompra() {
    this.seleccion.clear();
    this.tarjetas?.forEach(t => t.reiniciar());
  }
}