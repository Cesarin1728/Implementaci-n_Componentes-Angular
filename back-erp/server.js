require('dotenv').config();

const express = require('express');
const cors = require('cors'); // Para las peticiones

const app = express();

app.use(cors()); // Se habilitan los cors (siempre antes de las rutas)
app.use(express.json()); // Converte el JSON de la petición en req.body

const productoRoutes = require('./routes/producto.routes');
app.use('/api/productos', productoRoutes);

const ventaRoutes = require('./routes/venta.routes');
app.use('/api/ventas', ventaRoutes);

const compraRoutes = require('./routes/compra.routes');
app.use('/api/compras', compraRoutes);

const transaccionRoutes = require('./routes/transaccion.routes');
app.use('/api/transacciones', transaccionRoutes);

const paypalRoutes = require('./routes/paypal.routes');
app.use('/api/paypal', paypalRoutes);

const emailRoutes = require('./routes/email.routes');
app.use('/api/email', emailRoutes);

const usuarioRoutes = require('./routes/usuario.routes');
app.use('/api/usuarios', usuarioRoutes);
app.use('/api', usuarioRoutes);

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => { //Como nos dijo, es para ver si el servidor sí está corriendo
    console.log(`Servidor ejecutándose en http://localhost:${PUERTO}`);
}); //:)