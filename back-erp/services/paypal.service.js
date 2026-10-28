const db = require('../config/db');
const ventaService = require('./venta.service');

// Nosotros somos el cliente
const BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

// Almacenamiento temporal de órdenes
const ordenes = new Map();

// obtener token de acceso
async function obtenerToken() {
    const clienteID = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;

    const credenciales = Buffer.from(`${clienteID}:${secret}`).toString('base64');
    const respuesta = await fetch(`${BASE_URL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credenciales}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    if (!respuesta.ok) {
        throw new Error('Error de autenticación Paypal');
    }

    const datos = await respuesta.json();
    return datos.access_token;
}

// Enviar peticiones a Paypal
async function paypalRequest(ruta, metodo, body) {
    const token = await obtenerToken();
    const respuesta = await fetch(`${BASE_URL}${ruta}`, {
        method: metodo,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });

    const datos = await respuesta.json();
    if (!respuesta.ok) {
        console.error('Error de Paypal: ', datos);
        throw new Error('Operación de Paypal Rechazada');
    }
    return datos;
}

// Obtener producto de la base de datos de la cafetería
function obtenerProductoPorIdPromise(id) {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM Producto WHERE id = ?', [id], (error, resultados) => {
            if (error) return reject(error);
            resolve(resultados[0]);
        });
    });
}

// Crear orden validando precios en la BD
async function crearOrdenPaypal(carrito, cliente_id) {
    let totalCentavos = 0;
    const conceptosVenta = [];

    // Recibir productos y consultar precios de la bd
    for (const item of carrito) {
        const producto = await obtenerProductoPorIdPromise(item.id);

        if (!producto || !Number.isSafeInteger(item.cantidad) || item.cantidad < 1 || item.cantidad > 100) {
            throw { status: 400, message: 'Producto o cantidad inválida' };
        }

        const precioUnitario = Number(producto.costo_venta);
        const precioCentavos = Math.round(precioUnitario * 100);

        totalCentavos += precioCentavos * item.cantidad;

        conceptosVenta.push({
            producto_id: producto.id,
            cantidad: item.cantidad,
            precio_unitario: precioUnitario
        });
    }

    if (!Number.isSafeInteger(totalCentavos) || totalCentavos <= 0) {
        throw { status: 400, message: 'Total inválido' };
    }

    // Calcular total
    const total = (totalCentavos / 100).toFixed(2);

    // Crear orden mediante Paypal
    const orden = await paypalRequest('/v2/checkout/orders', 'POST', {
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'MXN',
                value: total
            }
        }]
    });

    // Devolver ID de la orden y guardar estado localmente
    ordenes.set(orden.id, {
        total,
        moneda: 'MXN',
        estado: 'CREADA',
        cliente_id: cliente_id || 1,
        conceptos: conceptosVenta
    });

    return { id: orden.id, total };
}

// Capturar orden y registrar en la BD
async function capturarOrdenPaypal(orderId) {
    // Recuperar la orden local
    const ordenLocal = ordenes.get(orderId);
    if (!ordenLocal) {
        throw { status: 404, message: 'Orden no encontrada' };
    }
    if (ordenLocal.estado !== 'CREADA') {
        throw { status: 409, message: 'La orden ya fue procesada' };
    }

    ordenLocal.estado = 'PROCESANDO';

    try {
        // Solicitar captura a Paypal
        const resultado = await paypalRequest(`/v2/checkout/orders/${orderId}/capture`, 'POST');

        // Verificar estado de importe
        const captura = resultado.purchase_units
            ?.flatMap(u => u.payments?.captures || [])
            .find(c => c.status === 'COMPLETED');

        const valido = resultado.id === orderId &&
            resultado.status === 'COMPLETED' &&
            captura?.amount?.currency_code === ordenLocal.moneda;

        if (!valido) {
            ordenLocal.estado = 'REVISION';
            throw { status: 409, message: 'Estado de pago no válido' };
        }

        ordenLocal.estado = 'PAGADA';
        ordenLocal.capturaId = captura.id;

        // Registrar el pago en la BD usando ventaService (resta stock, genera venta y registra ganancia)
        await new Promise((resolve, reject) => {
            ventaService.procesarVenta(
                ordenLocal.cliente_id,
                'PayPal',
                ordenLocal.conceptos,
                (error, resVenta) => {
                    if (error) {
                        console.error('Error al registrar la venta en la BD tras pago:', error);
                        return reject(error);
                    }
                    resolve(resVenta);
                }
            );
        });

        return {
            mensaje: 'Pago completado',
            orderId,
            captureId: captura.id,
            estado: ordenLocal.estado
        };

    } catch (error) {
        // No asumir que el pago falló
        if (ordenLocal && ordenLocal.estado === 'PROCESANDO') {
            ordenLocal.estado = 'REVISION';
        }
        throw error;
    }
}

module.exports = {
    paypalRequest,
    crearOrdenPaypal,
    capturarOrdenPaypal
};