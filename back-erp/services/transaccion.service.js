const db = require('../config/db');

// Registrar una transacción ligada a una venta, compra o nómina
function registrarTransaccion(tipo, concepto, monto, origen_tipo, origen_id, callback) {
    const ventaId = origen_tipo === 'venta' ? origen_id : null;
    const compraId = origen_tipo === 'compra' ? origen_id : null;
    const nominaId = origen_tipo === 'nomina' ? origen_id : null;

    const sql = `INSERT INTO transaccion (fecha, tipo, concepto, monto, origen_tipo, origen_id, Venta_id, Compra_id, Nomina_id)
    VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [tipo, concepto, monto, origen_tipo, origen_id, ventaId, compraId, nominaId], (error, resultado) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultado);
    });
}

// Obtener transacciones de un rango de fechas (para contabilidad)
function obtenerPorRango(inicio, fin, callback) {
    const sql = `SELECT * FROM transaccion
    WHERE fecha BETWEEN ? AND ?
    ORDER BY fecha DESC`;

    db.query(sql, [inicio, fin], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultados);
    });
}

module.exports = {
    registrarTransaccion,
    obtenerPorRango
};