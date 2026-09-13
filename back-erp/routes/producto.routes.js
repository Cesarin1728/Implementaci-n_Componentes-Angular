const express = require('express');
const router = express.Router();
const productoService = require('../services/producto.service');

// GET /api/productos - obtener todos los productos
router.get('/', (req, res) => {

    productoService.obtenerProductos((error, productos) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al consultar productos'
            });
        }

        res.json(productos);
    });
});

// GET /api/productos/:id - obtener un producto por id
router.get('/:id', (req, res) => {
    const id = req.params.id;

    productoService.obtenerProductoPorId(id, (error, producto) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al consultar el producto'
            });
        }

        if (!producto) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }
        res.json(producto);
    });
});

// PUT /api/productos/:id/sumar-stock - usado en Compras
router.put('/:id/sumar-stock', (req, res) => {
    const id = req.params.id;
    const { cantidad } = req.body;

    productoService.sumarStock(id, cantidad, (error) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al actualizar el stock'
            });
        }
        res.json({ mensaje: 'Stock actualizado' });
    });
});

// PUT /api/productos/:id/restar-stock - usado en Ventas
router.put('/:id/restar-stock', (req, res) => {
    const id = req.params.id;
    const { cantidad } = req.body;

    productoService.restarStock(id, cantidad, (error) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al actualizar el stock'
            });
        }
        res.json({ mensaje: 'Stock actualizado' });
    });
});

// PUT /api/productos/:id/stock - usado en Inventario
router.put('/:id/stock', (req, res) => {
    const id = req.params.id;
    const { nuevoStock } = req.body;

    productoService.establecerStock(id, nuevoStock, (error) => {
        if (error) {
            return res.status(500).json({
                mensaje: 'Error al establecer el stock'
            });
        }
        res.json({ mensaje: 'Stock establecido' });
    });
});

module.exports = router;