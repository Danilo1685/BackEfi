const express = require('express');
const router = express.Router();
const {
    getVentas,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta,
    deleteVentaPermanente
} = require('../controllers/venta.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// GET: admin y agente pueden ver todas las ventas
router.get('/', verifyToken, checkRole('admin', 'agente'), getVentas);

// GET por ID: admin y agente
router.get('/:id', verifyToken, checkRole('admin', 'agente'), getVentaById);

// POST: solo admin y agente pueden crear ventas
router.post('/', verifyToken, checkRole('admin', 'agente'), createVenta);

// PUT: solo admin y agente pueden actualizar ventas
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateVenta);

// DELETE lógico: admin y agente
router.delete('/:id', verifyToken, checkRole('admin', 'agente'), deleteVenta);

// DELETE físico: solo admin
router.delete('/:id/permanente', verifyToken, checkRole('admin'), deleteVentaPermanente);

module.exports = router;