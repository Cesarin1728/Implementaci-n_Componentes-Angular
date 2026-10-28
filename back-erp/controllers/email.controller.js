const emailService = require('../services/email.service');

async function enviarFactura(req, res) {
    const { conceptos, totales } = req.body;
    const correo = process.env.EMAIL_DESTINO || req.body.correo;

    if (!correo || !conceptos || !totales) {
        return res.status(400).json({
            mensaje: 'Faltan datos para generar el correo'
        });
    }

    try {
        await emailService.enviarFacturaCorreo(correo, conceptos, totales);
        res.json({
            mensaje: `Factura enviada a ${correo}`
        });
    } catch (error) {
        console.error('Error al enviar correo:', error);
        res.status(500).json({
            mensaje: 'Error al enviar el correo'
        });
    }
}

module.exports = {
    enviarFactura
};