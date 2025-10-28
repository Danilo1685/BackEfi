const express = require('express');
const router = express.Router();
const {
    getAllAlquileres,
    getAlquilerByClient,
    createAlquiler,
    updateAlquiler,
    deleteAlquiler,
    deleteAlquilerPermanente
} = require('../controllers/alquiler.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// ========================================
// RUTAS PARA ALQUILERES
// ========================================

// GET todos los alquileres (admin y agente)
router.get('/', verifyToken, checkRole('admin', 'agente'), getAllAlquileres);

// GET alquileres por cliente
router.get('/cliente/:clientId', verifyToken, checkRole('admin', 'agente', 'cliente'), getAlquilerByClient);

// POST crear alquiler (admin, agente, cliente)
router.post('/', verifyToken, checkRole('admin', 'agente', 'cliente'), createAlquiler);

// PUT actualizar alquiler (admin y agente)
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateAlquiler);

// DELETE eliminación lógica (admin, agente, cliente propio)
router.delete('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), deleteAlquiler);

// DELETE eliminación física (solo admin) - OPCIONAL
router.delete('/:id/permanente', verifyToken, checkRole('admin'), deleteAlquilerPermanente);

module.exports = router;