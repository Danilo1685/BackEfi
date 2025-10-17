const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ Configurar CORS ANTES de las rutas
app.use(cors({
  origin: 'http://localhost:5173', // O el puerto de tu Vite/React
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas (sin /api en el prefijo porque ya lo tenés en index.js)
app.use('/auth', require('./routers/auth.routes'));
// ... otras rutas

// Puerto
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;