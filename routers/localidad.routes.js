const express = require('express');
const router = express.Router();
const {
    getLocalidades,
    getLocalidadById,
    createLocalidad,
    updateLocalidad,
    deleteLocalidad
} = require('../controllers/localidad.controller');

const verifyToken = require('../middleware/verifyToken'); // Middleware de JWT
const checkRole = require('../middleware/checkRole');

// Rutas GET: solo admin y agente pueden acceder
router.get('/', verifyToken, checkRole('admin', 'agente', 'cliente'), getLocalidades);
router.get('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), getLocalidadById);

// Rutas solo para admin
router.post('/', verifyToken, checkRole('admin'), createLocalidad);
router.put('/:id', verifyToken, checkRole('admin'), updateLocalidad);
router.delete('/:id', verifyToken, checkRole('admin'), deleteLocalidad);

module.exports = router;
