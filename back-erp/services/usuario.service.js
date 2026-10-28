const conexion = require('../config/db');

// De momento sin los ? y poniendo datos de ejemplo manuales como se anotó en clase
function registrarUsuario(callback) {
    const sql = `INSERT INTO usuario (nombre, correo, password, rol) VALUES ('Yo mero', 'yo@gmail.com', '1234', 'Administrador')`;

    conexion.query(sql, (error, resultado) => {
        if (error) {
            console.error('Error al registrar usuario:', error);
            return callback(error, null);
        }
        callback(null, resultado);
    });
}

// Consulta para buscar el usuario por correo para el login
function buscarPorCorreo(correo, callback) {
    const sql = 'SELECT * FROM usuario WHERE correo = ?';

    conexion.query(sql, [correo], (error, resultados) => {
        if (error) {
            console.error('Error SQL al buscar por correo:', error);
            return callback(error, null);
        }
        callback(null, resultados);
    });
}

// Consulta para buscar el usuario por id
function buscarPorId(id, callback) {
    const sql = 'SELECT * FROM usuario WHERE id = ?';

    conexion.query(sql, [id], (error, resultados) => {
        if (error) {
            console.error('Error SQL al buscar por ID:', error);
            return callback(error, null);
        }
        callback(null, resultados);
    });
}

// Buscar trabajadores por nombre o id (usado en RH)
function buscarTrabajador(termino, callback) {
    const like = `%${termino}%`;
    const sql = 'SELECT id, nombre, correo, rol FROM usuario WHERE nombre LIKE ? OR id = ?';
    conexion.query(sql, [like, termino], (error, resultados) => {
        if (error) {
            console.error('Error SQL al buscar trabajador:', error);
            return callback(error, null);
        }
        callback(null, resultados);
    });
}

// Consulta para buscar usuarios por su rol
function buscarPorRol(rol, callback) {
    const sql = 'SELECT id, nombre, correo, salario, rfc FROM usuario WHERE rol = ?';
    conexion.query(sql, [rol], (error, resultados) => {
        if (error) {
            console.error('Error SQL al buscar por rol:', error);
            return callback(error, null);
        }
        callback(null, resultados);
    });
}

module.exports = {
    registrarUsuario,
    buscarPorCorreo,
    buscarPorId,
    buscarTrabajador,
    buscarPorRol
};