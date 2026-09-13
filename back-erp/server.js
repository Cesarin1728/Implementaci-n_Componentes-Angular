const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const productoRoutes = require('./routes/producto.routes');
app.use('/api/productos', productoRoutes);

const usuarioRoutes = require('./routes/usuario.routes');
app.use('/api/usuarios', usuarioRoutes);

const ventaRoutes = require('./routes/venta.routes');
app.use('/api/ventas', ventaRoutes);

const compraRoutes = require('./routes/compra.routes');
app.use('/api/compras', compraRoutes);

app.listen(3000, () => { //Como nos dijo, es para ver si el servidor sí está corriendo
    console.log('Servidor ejecutándose en http://localhost:3000');
}); //:)