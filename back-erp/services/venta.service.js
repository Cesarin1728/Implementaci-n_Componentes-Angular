const db = require('../config/db');
const productoService = require('./producto.service');
const transaccionService = require('./transaccion.service');

// Para una venta completa: inserta venta, detalles, resta stock y registra la ganancia
function procesarVenta(cliente_id, metodo_pago, conceptos, callback) {
    // conceptos: [{ producto_id, cantidad, precio_unitario }]
    const total = conceptos.reduce((acc, c) => acc + c.cantidad * c.precio_unitario, 0);
    const sqlVenta = 'INSERT INTO venta (cliente_id, fecha, total, metodo_pago) VALUES (?, NOW(), ?, ?)';

    db.query(sqlVenta, [cliente_id, total, metodo_pago], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        const ventaId = resultado.insertId;
        insertarDetalles(ventaId, conceptos, 0, (error) => {
            if (error) {
                callback(error, null);
                return;
            }
            restarStockDeConceptos(conceptos, 0, (error) => {
                if (error) {
                    callback(error, null);
                    return;
                }
                transaccionService.registrarTransaccion(
                    'ganancia', 'Venta de café', total, 'venta', ventaId,
                    (error) => {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        callback(null, { ventaId, total });
                    }
                );
            });
        });
    });
}

// Inserta los detalles de venta uno por uno
function insertarDetalles(ventaId, conceptos, index, callback) {
    if (index >= conceptos.length) {
        callback(null);
        return;
    }
    const c = conceptos[index];
    const sql = 'INSERT INTO detalle_venta (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)';
    db.query(sql, [ventaId, c.producto_id, c.cantidad, c.precio_unitario], (error) => {
        if (error) {
            callback(error);
            return;
        }
        insertarDetalles(ventaId, conceptos, index + 1, callback);
    });
}

// Resta el stock de cada producto vendido, uno por uno
function restarStockDeConceptos(conceptos, index, callback) {
    if (index >= conceptos.length) {
        callback(null);
        return;
    }
    const c = conceptos[index];
    productoService.restarStock(c.producto_id, c.cantidad, (error) => {
        if (error) {
            callback(error);
            return;
        }
        restarStockDeConceptos(conceptos, index + 1, callback);
    });
}

module.exports = {
    procesarVenta
};