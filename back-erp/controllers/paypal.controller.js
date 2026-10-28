const paypalService = require('../services/paypal.service');

// Controlador para crear orden
async function crearOrden(req, res) {
    try {
        const { productos: carrito, cliente_id } = req.body;

        if (!Array.isArray(carrito) || carrito.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        const orden = await paypalService.crearOrdenPaypal(carrito, cliente_id);
        res.json(orden);

    } catch (error) {
        console.error('Error al crear orden:', error);
        const status = error.status || 502;
        res.status(status).json({
            error: error.message || 'No se pudo crear la orden'
        });
    }
}

// Controlador para capturar orden
async function capturarOrden(req, res) {
    const { orderId } = req.params;

    try {
        const resultado = await paypalService.capturarOrdenPaypal(orderId);
        res.json(resultado);

    } catch (error) {
        console.error('Error al capturar orden:', error);
        const status = error.status || 502;
        res.status(status).json({
            error: error.message || 'Verificar estado del pago'
        });
    }
}

module.exports = {
    crearOrden,
    capturarOrden
};