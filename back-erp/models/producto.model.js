// Le añadimos el campo de la imagen, pues en el diagrama no lo tenía contemplado (en el DER solo añádí ese campo, entonces es un nuevo DER en el reporte)
class Producto {
    constructor(id, nombre, stock, costo_compra, costo_venta, costo_inicial, fecha_inicio, fecha_fin, disponible, imagen_url) {
        this.id = id;
        this.nombre = nombre;
        this.stock = stock;
        this.costo_compra = costo_compra;
        this.costo_venta = costo_venta;
        this.costo_inicial = costo_inicial;
        this.fecha_inicio = fecha_inicio;
        this.fecha_fin = fecha_fin;
        this.disponible = disponible;
        this.imagen_url = imagen_url;
    }
}

module.exports = Producto;