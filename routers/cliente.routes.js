const express = require('express');
const router = express.Router();
const {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
} = require('../controllers/clientController');

const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

// Obtener todos los clientes (admin o agente)
router.get('/', verifyToken, checkRole('admin', 'agente'), getClients);

// Obtener cliente por ID (admin o agente)
router.get('/:id', verifyToken, checkRole('admin', 'agente'), getClientById);

// Crear cliente (admin o agente)
router.post('/', verifyToken, checkRole('admin', 'agente'), createClient);

// Actualizar cliente (admin o agente)
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateClient);

// Eliminar cliente (solo admin)
router.delete('/:id', verifyToken, checkRole('admin'), deleteClient);

module.exports = router;
