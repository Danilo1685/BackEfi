const express = require('express');
const router = express.Router();
const {
    getTipos,
    getTipoById,
    createTipo,
    updateTipo,
    deleteTipo,
    deleteTipoPermanente
} = require('../controllers/tipoPropiedad.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// GET: cualquier usuario autenticado puede ver tipos
router.get('/', verifyToken, checkRole('admin', 'agente', 'cliente'), getTipos);
router.get('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), getTipoById);

// POST, PUT: admin y agente
router.post('/', verifyToken, checkRole('admin', 'agente'), createTipo);
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateTipo);

// DELETE lógico: admin y agente
router.delete('/:id', verifyToken, checkRole('admin', 'agente'), deleteTipo);

// DELETE físico: solo admin
router.delete('/:id/permanente', verifyToken, checkRole('admin'), deleteTipoPermanente);

module.exports = router;