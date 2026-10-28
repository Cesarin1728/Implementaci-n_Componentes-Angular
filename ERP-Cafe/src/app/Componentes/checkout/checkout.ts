import {
  Component, AfterViewInit, inject,
  NgZone, signal, CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { PaypalService } from '../../servicios/paypal.service';
import { ProductoService } from '../../servicios/producto.service';
import { usuarioActual } from '../inicio/inicio';
import { ProductoCarrito } from '../../modelos/paypal';

declare const paypal: any;

@Component({
  selector: 'app-checkout',
  imports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css'
})
export class Checkout implements AfterViewInit {

  private paypalService = inject(PaypalService);
  private productoService = inject(ProductoService);
  private router = inject(Router);
  private zone = inject(NgZone);
  private http = inject(HttpClient);

  private apiEmail = 'http://localhost:3000/api/email/enviar-factura';

  mensaje = signal('Preparando PayPal...');

  terminosAceptados = signal(false);

  modalVisible = signal(false);
  tipoModal = signal<'terminos' | 'privacidad'>('terminos');

  productos: ProductoCarrito[] = this.paypalService.carrito();

  toggleTerminos(evento: Event) {
    const check = (evento.target as HTMLInputElement).checked;
    this.terminosAceptados.set(check);
  }

  abrirModal(tipo: 'terminos' | 'privacidad') {
    this.tipoModal.set(tipo);
    this.modalVisible.set(true);
  }

  cerrarModal() {
    this.modalVisible.set(false);
  }

  async ngAfterViewInit() {
    if (this.productos.length === 0) {
      this.mensaje.set('No hay productos para pagar. Regresa a Ventas.');
      return;
    }

    try {
      const sdk = await paypal.createInstance({
        clientId: 'BAAn89bYEKk4KYsrOBDx9ckscupfi0OS7QmOp3ttD6P47h7CNhoN-tYjnt_Y8EufOK7_Xzm4xGoQ6zjL3g',
        components: ['paypal-payments'],
        pageType: 'checkout'
      });

      const metodos = await sdk.findEligibleMethods({
        currencyCode: 'MXN'
      });

      if (!metodos.isEligible('paypal')) {
        this.zone.run(() => {
          this.mensaje.set('PayPal no está disponible');
        });
        return;
      }

      const sesion = sdk.createPayPalOneTimePaymentSession({
        onApprove: async (data: { orderId: string }) => {
          try {
            const resultado = await firstValueFrom(
              this.paypalService.capturarOrden(data.orderId)
            );

            this.zone.run(() => {
              this.mensaje.set(resultado.mensaje);
              this.enviarFactura();
              this.paypalService.carrito.set([]);
              this.productoService.cargarProductos();
            });
          } catch {
            this.zone.run(() => {
              this.mensaje.set('Pago pendiente de verificación');
            });
          }
        },

        onCancel: () => {
          this.zone.run(() => {
            this.mensaje.set('Pago cancelado');
          });
        },

        onError: () => {
          this.zone.run(() => {
            this.mensaje.set('Error al procesar el pago');
          });
        }
      });

      const boton = document.querySelector('paypal-button');

      boton?.removeAttribute('hidden');

      boton?.addEventListener('click', async (event: any) => {
        if (!this.terminosAceptados()) {
          event?.stopImmediatePropagation?.();
          event?.preventDefault?.();
          alert('Debes aceptar los Términos y Condiciones y el Aviso de Privacidad para continuar.');
          return;
        }

        try {
          const u = usuarioActual();
          const clienteId = u ? u.id : 1;

          await sesion.start(
            { presentationMode: 'auto' },
            firstValueFrom(
              this.paypalService.crearOrden(this.productos, clienteId)
            ).then(orden => ({ orderId: orden.id }))
          );
        } catch {
          this.zone.run(() => {
            this.mensaje.set('No se pudo iniciar el pago');
          });
        }
      });

      this.zone.run(() => {
        this.mensaje.set('Selecciona PayPal para pagar');
      });

    } catch {
      this.zone.run(() => {
        this.mensaje.set('No se pudo cargar PayPal');
      });
    }
  }

  // Manda la factura XML por correo cuando el pago se completó
  private enviarFactura() {
    const conceptos = this.productos.map(item => {
      const producto = this.productoService.obtenerPorId(item.id);
      const precio = producto?.costo_venta ?? 0;
      return {
        nombre: producto?.nombre ?? '',
        cantidad: item.cantidad,
        precio,
        importe: precio * item.cantidad
      };
    });

    const subtotal = conceptos.reduce((acc, c) => acc + c.importe, 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    // El backend usa EMAIL_DESTINO del .env
    this.http.post<{ mensaje: string }>(this.apiEmail, {
      conceptos,
      totales: { subtotal, iva, total }
    }).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.mensaje.update(m => `${m} ${res.mensaje}`);
        });
      },
      error: (err) => console.error('Error al enviar la factura:', err)
    });
  }

  regresar() {
    this.router.navigate(['/ventas']);
  }
}