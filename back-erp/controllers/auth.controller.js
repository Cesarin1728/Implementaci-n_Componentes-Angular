const jwt = require('jsonwebtoken'); // Para crear el tooken
const authService = require('../services/usuario.service');

// Controlador de Registro
function registro(req, res) {
    // De momento sin hash y con datos manuales en la consulta
    authService.registrarUsuario((error, resultado) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error en la comunicación'
            });
        }
        res.status(201).json({
            mensaje: 'Usuario registrado'
        });
    });
}

// Controlador de Login
function login(req, res) {
    const { correo, contrasena } = req.body; // Datos que manda el front en el cuerpo de la petición

    authService.buscarPorCorreo(correo, (error, resultados) => { // Buscamos al usuario por correo
        if (error) {
            return res.status(500).json({ mensaje: 'Error del servidor' });
        }

        if (resultados.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const usuario = resultados[0]; // Primer usuario encontrado

        // De momento sin hash, se valida el string directo
        const passwordValido = (contrasena === (usuario.contrasena || usuario.password));

        if (!passwordValido) {
            return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
        }

        const token = jwt.sign( // Creamos el token con los datos del usuario y la clave secreta del .env
            {
                id: usuario.id,
                rol: usuario.rol
            },
            process.env.JWT_SECRET || 'secreto_super_seguro_erp_cafe',
            {
                expiresIn: '1h'
            }
        );

        res.json({ // Respuesta al front, la contraseña no se manda
            token: token,
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        });
    });
}

// Controlador de Perfil
function perfil(req, res) {
    authService.buscarPorId(req.usuario.id, (error, resultados) => { // req.usuario lo dejó el middleware validarToken (contiene id y rol del token)
        if (error) {
            return res.status(500).json({ mensaje: 'Error del servidor' });
        }

        if (resultados.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = resultados[0];

        res.json({
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol
        });
    });
}

module.exports = {
    registro,
    login,
    perfil
};