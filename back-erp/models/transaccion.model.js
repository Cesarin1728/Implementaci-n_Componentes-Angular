class Transaccion {
    constructor(id, fecha, tipo, concepto, monto, origen_tipo, origen_id, Venta_id, Compra_id, Nomina_id) {
        this.id = id;
        this.fecha = fecha;
        this.tipo = tipo;
        this.concepto = concepto;
        this.monto = monto;
        this.origen_tipo = origen_tipo;
        this.origen_id = origen_id;
        this.Venta_id = Venta_id;
        this.Compra_id = Compra_id;
        this.Nomina_id = Nomina_id;
    }
}

module.exports = Transaccion;