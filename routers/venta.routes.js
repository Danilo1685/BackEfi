const express = require('express');
const router = express.Router();
const {
    getVentas,
    getSolicitudesPendientes,
    aprobarSolicitud,
    rechazarSolicitud,
    getVentasByClient,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta,
    deleteVentaPermanente
} = require('../controllers/venta.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// ⚠️ IMPORTANTE: Rutas específicas ANTES de rutas con parámetros dinámicos

// ========================================
// ✅ NUEVAS RUTAS PARA SOLICITUDES
// ========================================

// GET solicitudes pendientes (solo admin y agente)
router.get('/pendientes', verifyToken, checkRole('admin', 'agente'), getSolicitudesPendientes);

// POST aprobar solicitud (solo admin y agente)
router.post('/:id/aprobar', verifyToken, checkRole('admin', 'agente'), aprobarSolicitud);

// POST rechazar solicitud (solo admin y agente)
router.post('/:id/rechazar', verifyToken, checkRole('admin', 'agente'), rechazarSolicitud);


router.get('/cliente/:clientId', verifyToken, checkRole('admin', 'agente', 'cliente'), getVentasByClient);


// GET: admin y agente pueden ver todas las ventas
router.get('/', verifyToken, checkRole('admin', 'agente'), getVentas);

// GET por ID: admin y agente
router.get('/:id', verifyToken, checkRole('admin', 'agente'), getVentaById);

// POST: crear venta/solicitud (admin, agente, cliente)
router.post('/', verifyToken, checkRole('admin', 'agente', 'cliente'), createVenta);

// PUT: solo admin y agente pueden actualizar ventas
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateVenta);

// DELETE lógico: admin, agente y cliente (su propia venta)
router.delete('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), deleteVenta);

// DELETE físico: solo admin
router.delete('/:id/permanente', verifyToken, checkRole('admin'), deleteVentaPermanente);

module.exports = router;