require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pdfRoutes = require('./routers/pdf.routes');



const app = express();

// ✅ Configurar CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Todas las rutas bajo /api
app.use('/api/auth', require('./routers/auth.routes'));
app.use('/api/propiedades', require('./routers/propiedad.routes'));
app.use('/api/usuarios', require('./routers/users.routes'));
app.use('/api/clientes', require('./routers/cliente.routes'));
app.use('/api/alquileres', require('./routers/alquiler.routes'));
app.use('/api/ventas', require('./routers/venta.routes'));
app.use('/api/tipos-propiedad', require('./routers/tipoPropiedad.routes'));
app.use('/api/pdf', pdfRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;