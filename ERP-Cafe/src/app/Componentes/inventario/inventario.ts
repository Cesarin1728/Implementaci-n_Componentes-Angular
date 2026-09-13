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
  //Aquí no necesitamos el servicio de transacción porque no se registran ventas ni compras, solo se cambia el stock de los productos
  constructor(private productoService: ProductoService) {}

  get productos() {
    return this.productoService.productos();
  }

  // Cuando se confirma el cambio de stock en una cafe-card
  onConfirmarStock(evento: { producto: Producto; nuevaCantidad: number }) {
    this.productoService.establecerStock(evento.producto.id, evento.nuevaCantidad); // Llamamos al servicio de producto para establecer el nuevo stock directamente
  }
}