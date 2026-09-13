const express = require('express');
const router = express.Router();
const ventaService = require('../services/venta.service');

// POST /api/ventas
router.post('/', (req, res) => {
    const { cliente_id, metodo_pago, conceptos } = req.body;
    if (!conceptos || conceptos.length === 0) {
        return res.status(400).json({
            mensaje: 'Selecciona al menos un producto'
        });
    }
    ventaService.procesarVenta(cliente_id, metodo_pago, conceptos, (error, resultado) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al procesar la venta'
            });
        }
        res.json(resultado);
    });
});

module.exports = router;