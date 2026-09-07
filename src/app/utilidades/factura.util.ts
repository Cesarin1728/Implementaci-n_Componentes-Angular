import { Producto } from '../modelos/producto';

export interface ConceptoFactura {
    producto: Producto;
    cantidad: number;
}

const IVA_TASA = 0.16;

const RFC_EMISOR_EJEMPLO = 'CAF010101AAA';
const RAZON_SOCIAL_EMISOR_EJEMPLO = 'Cafeteria ERP S.A. de C.V.';
const RFC_RECEPTOR_EJEMPLO = 'XAXX010101000';
const NOMBRE_RECEPTOR_EJEMPLO = 'Cliente General';

export function generarFacturaXML(conceptos: ConceptoFactura[]): string {
    const subtotal = conceptos.reduce(
        (acc, c) => acc + c.producto.costoVenta * c.cantidad,
        0
    );
    const iva = subtotal * IVA_TASA;
    const total = subtotal + iva;

    const folioFiscal = crypto.randomUUID();
    const fechaEmision = new Date().toISOString();

    const conceptosXml = conceptos
        .map(
        c => `
        <Concepto Descripcion="${c.producto.nombre}" Cantidad="${c.cantidad}" PrecioUnitario="${c.producto.costoVenta.toFixed(2)}" Importe="${(c.producto.costoVenta * c.cantidad).toFixed(2)}" />`
        )
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
    <Factura>
    <FolioFiscal>${folioFiscal}</FolioFiscal>
    <FechaEmision>${fechaEmision}</FechaEmision>
    <Emisor Rfc="${RFC_EMISOR_EJEMPLO}" RazonSocial="${RAZON_SOCIAL_EMISOR_EJEMPLO}" RegimenFiscal="601" />
    <Receptor Rfc="${RFC_RECEPTOR_EJEMPLO}" Nombre="${NOMBRE_RECEPTOR_EJEMPLO}" UsoCFDI="G03" />
    <Conceptos>${conceptosXml}
    </Conceptos>
    <Subtotal>${subtotal.toFixed(2)}</Subtotal>
    <IVA>${iva.toFixed(2)}</IVA>
    <Total>${total.toFixed(2)}</Total>
    <MetodoPago>PUE</MetodoPago>
    <FormaPago>Efectivo</FormaPago>
    </Factura>`;
    }

    export function descargarXML(nombreArchivo: string, contenidoXml: string) {
    const blob = new Blob([contenidoXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();

    URL.revokeObjectURL(url);
}