const express = require('express');
const router = express.Router();
const {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertiesInactivas,
    restaurarProperty,
    deletePropertyPermanente
} = require('../controllers/propiedad.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas con parámetros dinámicos /:id

// ========================================
// RUTAS PARA PROPIEDADES INACTIVAS (ANTES de /:id)
// ========================================

// GET propiedades INACTIVAS (solo admin)
router.get('/inactivas', verifyToken, checkRole('admin'), getPropertiesInactivas);

// ========================================
// RUTAS PARA PROPIEDADES ACTIVAS
// ========================================

// GET todas las propiedades activas (cualquier usuario autenticado)
router.get('/', verifyToken, checkRole('admin', 'agente', 'cliente'), getProperties);

// GET propiedad por ID (debe ir DESPUÉS de /inactivas)
router.get('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), getPropertyById);

// POST crear nueva propiedad (solo admin o agente)
router.post('/', verifyToken, checkRole('admin', 'agente'), createProperty);

// PUT actualizar propiedad (solo admin o agente)
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateProperty);

// DELETE eliminación LÓGICA (solo admin y agente)
router.delete('/:id', verifyToken, checkRole('admin', 'agente'), deleteProperty);

// ========================================
// RUTAS ADICIONALES (DESPUÉS de las rutas básicas)
// ========================================

// PATCH restaurar propiedad (cambiar activo a true) - Solo admin
router.patch('/:id/restaurar', verifyToken, checkRole('admin'), restaurarProperty);

// DELETE eliminación FÍSICA/PERMANENTE - Solo admin
router.delete('/:id/permanente', verifyToken, checkRole('admin'), deletePropertyPermanente);

module.exports = router;