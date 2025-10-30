const express = require('express');
const router = express.Router();
const {
    getAllAlquileres,
    getSolicitudesPendientes,
    aprobarSolicitud,
    rechazarSolicitud,
    getAlquilerByClient,
    createAlquiler,
    updateAlquiler,
    deleteAlquiler,
    deleteAlquilerPermanente
} = require('../controllers/alquiler.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');


// GET solicitudes pendientes (solo admin y agente)
router.get('/pendientes', verifyToken, checkRole('admin', 'agente'), getSolicitudesPendientes);

// POST aprobar solicitud (solo admin y agente)
router.post('/:id/aprobar', verifyToken, checkRole('admin', 'agente'), aprobarSolicitud);

// POST rechazar solicitud (solo admin y agente)
router.post('/:id/rechazar', verifyToken, checkRole('admin', 'agente'), rechazarSolicitud);

// ========================================
// RUTAS PARA CLIENTES
// ========================================

router.get('/cliente/:clientId', verifyToken, checkRole('admin', 'agente', 'cliente'), getAlquilerByClient);

// ========================================
// RUTAS PARA ADMIN/AGENTE
// ========================================

// GET todos los alquileres (admin y agente)
router.get('/', verifyToken, checkRole('admin', 'agente'), getAllAlquileres);

// POST crear alquiler/solicitud (admin, agente, cliente)
router.post('/', verifyToken, checkRole('admin', 'agente', 'cliente'), createAlquiler);

// PUT actualizar alquiler (admin y agente)
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateAlquiler);

// DELETE eliminación lógica (admin, agente, cliente propio)
router.delete('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), deleteAlquiler);

// DELETE eliminación física (solo admin)
router.delete('/:id/permanente', verifyToken, checkRole('admin'), deleteAlquilerPermanente);

module.exports = router;