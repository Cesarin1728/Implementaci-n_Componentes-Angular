const express = require('express');
const router = express.Router();
const transaccionService = require('../services/transaccion.service');

// GET /api/transacciones
router.get('/', (req, res) => {
    const { inicio, fin } = req.query;

    if (!inicio || !fin) {
        return res.status(400).json({
            mensaje: 'Debes indicar fecha de inicio y fin'
        });
    }

    // Le agregamos la hora al final del día, para incluir todas las transacciones de ese día
    const finConHora = `${fin} 23:59:59`;

    transaccionService.obtenerPorRango(inicio, finConHora, (error, transacciones) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al consultar transacciones'
            });
        }
        res.json(transacciones);
    });
});

module.exports = router;