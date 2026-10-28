const express = require('express');
const router = express.Router();
const transaccionService = require('../services/transaccion.service');

// GET /api/transacciones
router.get('/', (req, res) => {
    const { inicio, fin } = req.query;

    if (!inicio || !fin) {
        return res.status(400).json({
            mensaje: 'Debes indicar ambas fechas (inicio y fin)'
        });
    }

    const inicioCompleto = `${inicio} 00:00:00`;
    const finCompleto = `${fin} 23:59:59`;

    transaccionService.obtenerPorRango(inicioCompleto, finCompleto, (error, transacciones) => {
        if (error) {
            console.error('Error al consultar transacciones:', error);
            return res.status(500).json({
                mensaje: 'Error al consultar transacciones'
            });
        }
        res.json(transacciones);
    });
});

module.exports = router;