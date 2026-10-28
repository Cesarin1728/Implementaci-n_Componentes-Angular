const express = require('express');
const router = express.Router(); // Rutas que van a app.js con /api

const authController = require('../controllers/auth.controller'); //Las funciones que van a ejecutar las rutas
const { validarToken } = require('../middleware/auth.middleware'); // Revisamos el token antes de la peticióñ
const usuarioService = require('../services/usuario.service');

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.get('/perfil', validarToken, authController.perfil); // Solo en esta ruta se valida el token

// GET /api/usuarios/buscar?termino=xxx (usado en RH)
router.get('/buscar', validarToken, (req, res) => {
    const termino = req.query.termino || '';

    usuarioService.buscarTrabajador(termino, (error, usuarios) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al buscar trabajadores'
            });
        }
        res.json(usuarios);
    });
});

// GET /api/usuarios/:id
router.get('/:id', validarToken, (req, res) => {
    const id = req.params.id;

    usuarioService.buscarPorId(id, (error, usuario) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al consultar el usuario'
            });
        }

        if (!usuario || usuario.length === 0) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(usuario[0]);
    });
});

// GET /api/usuarios/rol/:rol (usado en Contabilidad)
router.get('/rol/:rol', validarToken, (req, res) => {
    const rol = req.params.rol;

    usuarioService.buscarPorRol(rol, (error, usuarios) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al buscar usuarios por rol'
            });
        }
        res.json(usuarios);
    });
});

// POST /api/usuarios/llegada
router.post('/llegada', (req, res) => {
    const { administrador_id } = req.body;
    if (!administrador_id) {
        return res.status(400).json({ mensaje: 'ID de administrador requerido' });
    }

    const sql = 'INSERT INTO asistencia (administrador_id, hora_llegada) VALUES (?, NOW())';
    conexion.query(sql, [administrador_id], (error, resultado) => {
        if (error) {
            console.error('Error al insertar asistencia:', error);
            return res.status(500).json({ mensaje: 'Error al registrar llegada en la BD' });
        }
        res.json({ mensaje: 'Llegada registrada en BD', id: resultado.insertId });
    });
});

module.exports = router;