class Venta {
    constructor(id, cliente_id, fecha, total, metodo_pago) {
        this.id = id;
        this.cliente_id = cliente_id;
        this.fecha = fecha;
        this.total = total;
        this.metodo_pago = metodo_pago;
    }
}

module.exports = Venta;