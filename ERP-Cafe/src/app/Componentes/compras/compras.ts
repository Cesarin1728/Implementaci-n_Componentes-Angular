import { Component, ViewChildren, QueryList } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CafeCard } from '../cafe-card/cafe-card';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../modelos/producto';
import { usuarioActual } from '../inicio/inicio';

@Component({
  imports: [CafeCard],
  selector: 'app-compras',
  styleUrl: './compras.css',
  templateUrl: './compras.html',
})
export class Compras {
  private api = 'http://localhost:3000/api/compras';

  private seleccion = new Map<number, number>();

  @ViewChildren(CafeCard) tarjetas!: QueryList<CafeCard>;

  constructor(
    private productoService: ProductoService,
    private http: HttpClient
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

    const u = usuarioActual();
    if (!u) return;

    // Armamos el body que espera el backend: producto_id, cantidad y costo_unitario (costo_compra)
    const conceptos = Array.from(this.seleccion.entries()).map(([id, cantidad]) => {
      const producto = this.productoService.obtenerPorId(id);
      return {
        producto_id: id,
        cantidad,
        costo_unitario: producto?.costo_compra ?? 0
      };
    });

    const body = {
      administrador_id: u.id,
      conceptos
    };

    // Le pedimos al backend que procese la compra completa 
    this.http.post(this.api, body).subscribe({

      next: () => {
        alert('Compra a proveedor registrada.');
        this.productoService.cargarProductos(); // Recargamos el stock desde la BD
        this.cancelarCompra();
      },

      error: () => {
        alert('Ocurrió un error al procesar la compra.');
      }

    });
  }

  cancelarCompra() {
    this.seleccion.clear();
    this.tarjetas?.forEach(t => t.reiniciar());
  }
}