const express = require('express');
const router = express.Router();
const compraService = require('../services/compra.service');

// POST /api/compras
router.post('/', (req, res) => {
    const { administrador_id, conceptos } = req.body;
    if (!conceptos || conceptos.length === 0) {
        return res.status(400).json({
            mensaje: 'Selecciona al menos un producto'
        });
    }

    compraService.procesarCompra(administrador_id, conceptos, (error, resultado) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al procesar la compra'
            });
        }

        res.json(resultado);
    });
});

module.exports = router;