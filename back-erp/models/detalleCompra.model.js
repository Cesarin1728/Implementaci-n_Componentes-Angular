class DetalleCompra {
    constructor(id, compra_id, producto_id, cantidad, costo_unitario) {
        this.id = id;
        this.compra_id = compra_id;
        this.producto_id = producto_id;
        this.cantidad = cantidad;
        this.costo_unitario = costo_unitario;
    }
}

module.exports = DetalleCompra;