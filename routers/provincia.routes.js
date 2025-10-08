const express = require('express');
const router = express.Router();
const {
    getProvincias,
    getProvinciaById,
    createProvincia,
    updateProvincia,
    deleteProvincia
} = require('../controllers/provincia.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// Rutas GET: cualquier usuario autenticado puede ver provincias
router.get('/', verifyToken, checkRole('admin', 'agente', 'cliente'), getProvincias);
router.get('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), getProvinciaById);

// Rutas de modificación: solo admin
router.post('/', verifyToken, checkRole('admin'), createProvincia);
router.put('/:id', verifyToken, checkRole('admin'), updateProvincia);
router.delete('/:id', verifyToken, checkRole('admin'), deleteProvincia);

module.exports = router;
