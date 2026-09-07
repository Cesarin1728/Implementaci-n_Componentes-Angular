import { Component } from '@angular/core';
import { CafeCard } from '../cafe-card/cafe-card';
import { ProductoService } from '../../servicios/producto.service';
import { Producto } from '../../modelos/producto';

@Component({
  imports: [CafeCard],
  selector: 'app-inventario',
  styleUrl: './inventario.css',
  templateUrl: './inventario.html',
})
export class Inventario {
  constructor(private productoService: ProductoService) {}

  get productos() {
    return this.productoService.productos();
  }

  onConfirmarStock(evento: { producto: Producto; nuevaCantidad: number }) {
    this.productoService.establecerStock(evento.producto.id, evento.nuevaCantidad);
  }
}