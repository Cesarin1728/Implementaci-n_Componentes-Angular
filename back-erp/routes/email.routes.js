const express = require('express');
const router = express.Router();
const emailController = require('../controllers/email.controller');

// POST /api/email/enviar-factura
router.post('/enviar-factura', emailController.enviarFactura);

module.exports = router;