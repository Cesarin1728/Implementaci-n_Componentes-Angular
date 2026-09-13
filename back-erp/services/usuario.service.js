const db = require('../config/db');

// Login: buscar usuario por correo y password
function login(correo, password, callback) {
    const sql = 'SELECT * FROM Usuario WHERE correo = ? AND password = ?';
    db.query(sql, [correo, password], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultados[0]);
    });
}

// Obtener un usuario por su id
function obtenerUsuarioPorId(id, callback) {
    const sql = 'SELECT * FROM Usuario WHERE id = ?';
    db.query(sql, [id], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultados[0]);
    });
}

// Buscar trabajadores por nombre o id (usado en RH)
function buscarTrabajador(termino, callback) {
    const like = `%${termino}%`;
    const sql = 'SELECT * FROM Usuario WHERE nombre LIKE ? OR id = ?';
    db.query(sql, [like, termino], (error, resultados) => {
        if (error) {
            callback(error, null);
            return;
        }
        callback(null, resultados);
    });
}

module.exports = {
    login,
    obtenerUsuarioPorId,
    buscarTrabajador
};