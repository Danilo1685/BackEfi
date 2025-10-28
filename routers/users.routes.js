const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// ⚠️ IMPORTANTE: Las rutas específicas DEBEN ir ANTES de las rutas con parámetros dinámicos /:id

// ========================================
// RUTAS PARA USUARIOS INACTIVOS (ANTES de /:id)
// ========================================

// GET usuarios INACTIVOS (solo admin)
router.get('/inactivos', verifyToken, checkRole('admin'), userController.getUsuariosInactivos);

// ========================================
// RUTAS PARA USUARIOS ACTIVOS
// ========================================

// GET todos los usuarios activos
router.get('/', verifyToken, checkRole('admin'), userController.getUsuarios);

// GET usuario por ID (debe ir DESPUÉS de /inactivos)
router.get('/:id', verifyToken, checkRole('admin', 'cliente', 'agente'), userController.getUsuarioById);

// POST crear nuevo usuario
router.post('/', verifyToken, checkRole('admin'), userController.createUsuario);

// PUT actualizar usuario
router.put('/:id', verifyToken, checkRole('admin'), userController.updateUsuario);

// DELETE eliminación LÓGICA (cambiar activo a false)
router.delete('/:id', verifyToken, checkRole('admin'), userController.deleteUsuario);

// ========================================
// RUTAS ADICIONALES (DESPUÉS de las rutas básicas)
// ========================================

// PATCH restaurar usuario (cambiar activo a true) - Solo admin
router.patch('/:id/restaurar', verifyToken, checkRole('admin'), userController.restaurarUsuario);

// DELETE eliminación FÍSICA/PERMANENTE - Solo admin
router.delete('/:id/permanente', verifyToken, checkRole('admin'), userController.deleteUsuarioPermanente);

module.exports = router;