const jwt = require('jsonwebtoken'); // Librería para verificar tokens

function validarToken(req, res, next) {
    const authHeader = req.headers.authorization; // Recibimos el token que manda el front con encabezado Bearer

    if (!authHeader || !authHeader.startsWith('Bearer ')) { // Si no hay token o no empieza con Bearer no hay token
        return res.status(401).json({
            mensaje: 'Sin token'
        });
    }

    const token = authHeader.split(' ')[1]; // Nos quedamos solo con el token, quitamos Bearer

    try {
        const datos = jwt.verify(token, process.env.JWT_SECRET); // Verificamos el token con la clave secreta del .env

        req.usuario = datos;

        next(); // Dejamos pasar la petición al controlador
    } catch (error) {
        // el jwt.verify lanza error si el token está alterado o caduco
        return res.status(401).json({
            mensaje: error.name === 'TokenExpiredError'
                ? 'El token caducado'
                : 'Token inválido'
        });
    }
}

module.exports = { validarToken };