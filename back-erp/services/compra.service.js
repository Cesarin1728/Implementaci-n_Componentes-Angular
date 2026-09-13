const db = require('../config/db');
const productoService = require('./producto.service');
const transaccionService = require('./transaccion.service');

// Procesa una compra completa: inserta compra, detalles, suma stock y registra el gasto
function procesarCompra(administrador_id, conceptos, callback) {
    // conceptos: [{ producto_id, cantidad, costo_unitario }]
    const total = conceptos.reduce((acc, c) => acc + c.cantidad * c.costo_unitario, 0);
    const sqlCompra = 'INSERT INTO compra (administrador_id, fecha, total) VALUES (?, NOW(), ?)';

    db.query(sqlCompra, [administrador_id, total], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        const compraId = resultado.insertId;

        insertarDetalles(compraId, conceptos, 0, (error) => {
            if (error) {
                callback(error, null);
                return;
            }
            sumarStockDeConceptos(conceptos, 0, (error) => {
                if (error) {
                    callback(error, null);
                    return;
                }
                transaccionService.registrarTransaccion(
                    'gasto', 'Compra de café a proveedor', total, 'compra', compraId,
                    (error) => {
                        if (error) {
                            callback(error, null);
                            return;
                        }
                        callback(null, { compraId, total });
                    }
                );
            });
        });
    });
}

// Inserta los detalles de compra uno por uno
function insertarDetalles(compraId, conceptos, index, callback) {
    if (index >= conceptos.length) {
        callback(null);
        return;
    }

    const c = conceptos[index];
    const sql = 'INSERT INTO detalle_compra (compra_id, producto_id, cantidad, costo_unitario) VALUES (?, ?, ?, ?)';

    db.query(sql, [compraId, c.producto_id, c.cantidad, c.costo_unitario], (error) => {
        if (error) {
            callback(error);
            return;
        }
        insertarDetalles(compraId, conceptos, index + 1, callback);
    });
}

// Suma el stock de cada producto comprado, uno por uno
function sumarStockDeConceptos(conceptos, index, callback) {
    if (index >= conceptos.length) {
        callback(null);
        return;
    }

    const c = conceptos[index];
    productoService.sumarStock(c.producto_id, c.cantidad, (error) => {

        if (error) {
            callback(error);
            return;
        }

        sumarStockDeConceptos(conceptos, index + 1, callback);
    });
}

module.exports = {
    procesarCompra
};