const express = require('express');
const router = express.Router();
const { 
    getClients, 
    getClientById, 
    createClient, 
    updateClient, 
    deleteClient,
    deleteClientPermanente
} = require('../controllers/cliente.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// Obtener todos los clientes (admin y agente)
router.get('/', verifyToken, checkRole('admin', 'agente'), getClients);

// Obtener cliente por ID (admin y agente)
router.get('/:id', verifyToken, checkRole('admin', 'agente'), getClientById);

// Crear cliente (admin y agente)
router.post('/', verifyToken, checkRole('admin', 'agente'), createClient);

// Actualizar cliente (admin y agente)
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateClient);

// Eliminación lógica (admin y agente)
router.delete('/:id', verifyToken, checkRole('admin', 'agente'), deleteClient);

// Eliminación física (solo admin)
router.delete('/:id/permanente', verifyToken, checkRole('admin'), deleteClientPermanente);

module.exports = router;