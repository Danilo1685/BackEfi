require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar routers
const usersRouter = require('./routers/users.routes');
const authRouter = require('./routers/auth.routes');
const propiedadRouter = require('./routers/propiedad.routes');
const clienteRouter = require('./routers/cliente.routes');
const ventaRouter = require('./routers/venta.routes');
const alquilerRouter = require('./routers/alquiler.routes');
const tipoPropiedadRouter = require('./routers/tipoPropiedad.routes');

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.json({ 
        message: 'API REST - Sistema de Gestión Inmobiliaria',
        version: '1.0.0',
        endpoints: {
            auth: '/auth',
            usuarios: '/usuarios',
            propiedades: '/propiedades',
            clientes: '/clientes',
            ventas: '/ventas',
            alquileres: '/alquileres',
            tipos_propiedad: '/tipos-propiedad'
        }
    });
});

// Rutas de la API
app.use('/auth', authRouter);
app.use('/usuarios', usersRouter);
app.use('/propiedades', propiedadRouter);
app.use('/clientes', clienteRouter);
app.use('/ventas', ventaRouter);
app.use('/alquileres', alquilerRouter);
app.use('/tipos-propiedad', tipoPropiedadRouter);

// Manejo de rutas no encontradas
app.use((req, res) => {
    res.status(404).json({ 
        status: 404,
        message: 'Ruta no encontrada' 
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({ 
        status: err.status || 500,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
    console.log(`📝 Documentación disponible en http://localhost:${port}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Error no manejado:', err);
    process.exit(1);
});

module.exports = app;