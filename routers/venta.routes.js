const express = require('express');
const router = express.Router();
const {
    getVentas,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta
} = require('../controllers/venta.controller');

const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

// GET: cualquier usuario autenticado puede ver ventas
router.get('/', verifyToken, checkRole('admin', 'agente', 'cliente'), getVentas);
router.get('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), getVentaById);

// POST, PUT, DELETE: solo admin o agente
router.post('/', verifyToken, checkRole('admin', 'agente'), createVenta);
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateVenta);
router.delete('/:id', verifyToken, checkRole('admin', 'agente'), deleteVenta);

module.exports = router;
