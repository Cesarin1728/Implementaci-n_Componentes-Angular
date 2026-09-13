const express = require('express');
const router = express.Router();
const usuarioService = require('../services/usuario.service');

// POST /api/usuarios/login
router.post('/login', (req, res) => {
    const { correo, password } = req.body;

    usuarioService.login(correo, password, (error, usuario) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al iniciar sesión'
            });
        }

        if (!usuario) {
            return res.status(401).json({
                mensaje: 'Credenciales incorrectas'
            });
        }
        res.json(usuario);
    });
});

// GET /api/usuarios/buscar?termino=xxx (usado en RH)
router.get('/buscar', (req, res) => {
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
router.get('/:id', (req, res) => {
    const id = req.params.id;

    usuarioService.obtenerUsuarioPorId(id, (error, usuario) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al consultar el usuario'
            });
        }

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(usuario);
    });
});

module.exports = router;