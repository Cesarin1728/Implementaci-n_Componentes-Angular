const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporte = nodemailer.createTransport({// Configuramos con las crendenciales emisoras. De momento mi correo también
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const RFC_EMISOR_EJEMPLO = 'CAF010101AAA';
const RAZON_SOCIAL_EMISOR_EJEMPLO = 'Cafeteria ERP S.A. de C.V.';
const RFC_RECEPTOR_EJEMPLO = 'XAXX010101000';
const NOMBRE_RECEPTOR_EJEMPLO = 'Cliente General';

function escaparXml(texto) {
    return String(texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function generarFacturaXML(conceptos, totales) {
    //Creamos el nodo concepto
    const conceptosXml = conceptos
        .map(c => `
        <Concepto Descripcion="${escaparXml(c.nombre)}" Cantidad="${c.cantidad}" PrecioUnitario="${Number(c.precio).toFixed(2)}" Importe="${Number(c.importe).toFixed(2)}" />`)
        .join('');

        //Cuerpo del XML
    return `<?xml version="1.0" encoding="UTF-8"?>
<Factura>
    <FolioFiscal>${crypto.randomUUID()}</FolioFiscal>
    <FechaEmision>${new Date().toISOString()}</FechaEmision>
    <Emisor Rfc="${RFC_EMISOR_EJEMPLO}" RazonSocial="${RAZON_SOCIAL_EMISOR_EJEMPLO}" RegimenFiscal="601" />
    <Receptor Rfc="${RFC_RECEPTOR_EJEMPLO}" Nombre="${NOMBRE_RECEPTOR_EJEMPLO}" UsoCFDI="G03" />
    <Conceptos>${conceptosXml}
    </Conceptos>
    <Subtotal>${Number(totales.subtotal).toFixed(2)}</Subtotal>
    <IVA>${Number(totales.iva).toFixed(2)}</IVA>
    <Total>${Number(totales.total).toFixed(2)}</Total>
    <MetodoPago>PUE</MetodoPago>
    <FormaPago>Efectivo</FormaPago>
</Factura>`;
}

// Envía el XML escrito en el cuerpo del correo
async function enviarFacturaCorreo(correo, conceptos, totales) {
    const xml = generarFacturaXML(conceptos, totales);

    await transporte.sendMail({
        from: process.env.EMAIL_USER,
        to: correo,
        subject: 'Factura de tu compra - ERP Cafetería',
        text: xml
    });
}

module.exports = {
    enviarFacturaCorreo,
    generarFacturaXML
};