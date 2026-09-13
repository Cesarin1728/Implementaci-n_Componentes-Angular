class Compra {
    constructor(id, administrador_id, fecha, total) {
        this.id = id;
        this.administrador_id = administrador_id;
        this.fecha = fecha;
        this.total = total;
    }
}

module.exports = Compra;