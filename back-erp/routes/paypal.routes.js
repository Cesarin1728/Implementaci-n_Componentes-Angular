const express = require('express');
const router = express.Router();
const paypalController = require('../controllers/paypal.controller');

// POST /api/paypal/orden
router.post('/orden', paypalController.crearOrden);

// POST /api/paypal/capturar/:orderId
router.post('/capturar/:orderId', paypalController.capturarOrden);

module.exports = router;