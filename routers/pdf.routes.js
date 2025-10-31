const express = require('express');
const router = express.Router();
const {
    generarContratoAlquiler,
    generarReciboVenta
} = require('../controllers/pdf.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');


// GET: Generar contrato de alquiler (cliente, agente, admin)
router.get('/alquiler/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), generarContratoAlquiler);

// GET: Generar recibo de venta (cliente, agente, admin)
router.get('/venta/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), generarReciboVenta);

module.exports = router;