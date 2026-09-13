const db = require('../config/db');

// Obtener todos los productos
function obtenerProductos(callback) {

    const sql = 'SELECT * FROM Producto';

    db.query(sql, (error, resultados) => {

        if (error) {
            callback(error, null);
            return;
        }

        callback(null, resultados);

    });

}

// Obtener un producto por su id
function obtenerProductoPorId(id, callback) {

    const sql = 'SELECT * FROM Producto WHERE id = ?';

    db.query(sql, [id], (error, resultados) => {

        if (error) {
            callback(error, null);
            return;
        }

        callback(null, resultados[0]);

    });

}

// Sumar stock (usado en Compras)
function sumarStock(id, cantidad, callback) {

    const sql = 'UPDATE Producto SET stock = stock + ? WHERE id = ?';

    db.query(sql, [cantidad, id], (error, resultado) => {

        if (error) {
            callback(error, null);
            return;
        }

        callback(null, resultado);

    });

}

// Restar el stock (usado en Ventas)
function restarStock(id, cantidad, callback) {

    const sql = 'UPDATE Producto SET stock = stock - ? WHERE id = ?';

    db.query(sql, [cantidad, id], (error, resultado) => {

        if (error) {
            callback(error, null);
            return;
        }

        callback(null, resultado);

    });

}

// Establecer el stock directo (usado en Inventario)
function establecerStock(id, nuevoStock, callback) {

    const sql = 'UPDATE Producto SET stock = ? WHERE id = ?';

    db.query(sql, [nuevoStock, id], (error, resultado) => {

        if (error) {
            callback(error, null);
            return;
        }

        callback(null, resultado);

    });

}

module.exports = {
    obtenerProductos,
    obtenerProductoPorId,
    sumarStock,
    restarStock,
    establecerStock
};