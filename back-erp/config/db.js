const mysql = require('mysql2');

const conexion = mysql.createConnection({ //Creamos la conexión con los datos del .env
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    database: process.env.DB_NAME || 'erp_cafeteria'
});

// Abre la conexión y dice si salió mal
conexion.connect((error) => {
    if (error) {
        console.error('Error de conexión:', error);
        return;
    }
    console.log('Conectado a MySQL');
});

// Exportamos la conexión para usarla en otros archivos
module.exports = conexion;