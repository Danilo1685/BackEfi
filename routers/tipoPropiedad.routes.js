const express = require('express');
const router = express.Router();
const {
    getTipos,
    createTipo,
    updateTipo,
    deleteTipo
} = require('../controllers/tipoPropiedad.controller');

const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

// GET: cualquier usuario autenticado puede ver tipos
router.get('/', verifyToken, checkRole('admin', 'agente', 'cliente'), getTipos);

// POST, PUT, DELETE: solo admin
router.post('/', verifyToken, checkRole('admin'), createTipo);
router.put('/:id', verifyToken, checkRole('admin'), updateTipo);
router.delete('/:id', verifyToken, checkRole('admin'), deleteTipo);

module.exports = router;
