import { Component, ViewChildren, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CafeCard } from '../cafe-card/cafe-card';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../modelos/producto';
import { usuarioActual } from '../inicio/inicio';
import { generarFacturaXML, descargarXML, ConceptoFactura } from '../../utilidades/factura.util';

@Component({
  imports: [CafeCard],
  selector: 'app-ventas',
  styleUrl: './ventas.css',
  templateUrl: './ventas.html',
})
export class Ventas {
  private api = 'http://localhost:3000/api/ventas';

  // Guardamos el producto y la cantidad que quiere comprar
  private seleccion = new Map<number, number>();

  @ViewChildren(CafeCard) tarjetas!: QueryList<CafeCard>;
  // Referencia a las tarjetas de café

  constructor(
    private productoService: ProductoService, // Inyectamos los servicios, ccmo con hexagonal
    private http: HttpClient
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

    const u = usuarioActual();
    if (!u) return;

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

    // Armamos el body que espera el backend: producto_id, cantidad y precio_unitario (costo_venta)
    const body = {
      cliente_id: u.id,
      metodo_pago: 'Efectivo',
      conceptos: conceptos.map(c => ({
        producto_id: c.producto.id,
        cantidad: c.cantidad,
        precio_unitario: c.producto.costo_venta
      }))
    };

    // Le decimos al backend que procese la venta (inserta venta, detalles, resta stock y registra la ganancia)
    this.http.post(this.api, body).subscribe({

      next: () => {
        // Generamos la factura en el XML
        const xml = generarFacturaXML(conceptos);
        descargarXML(`factura-${Date.now()}.xml`, xml); // Para descargar el XML

        this.productoService.cargarProductos(); // Recargamos el stock desde la BD
        this.cancelarCompra();
      },

      error: () => {
        alert('Ocurrió un error al procesar la venta.');
      }

    });
  }

  //Al final de una compra o al dar en cancelar
  cancelarCompra() {
    this.seleccion.clear();
    this.tarjetas?.forEach(t => t.reiniciar());
  }
}