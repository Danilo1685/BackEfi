const express = require('express');
const router = express.Router();
const {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
} = require('../controllers/propiedad.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

// GET: cualquier usuario autenticado puede ver propiedades
router.get('/', verifyToken, checkRole('admin', 'agente', 'cliente'), getProperties);
router.get('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), getPropertyById);

// POST y PUT: solo admin o agente
router.post('/', verifyToken, checkRole('admin', 'agente'), createProperty);
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateProperty);

// DELETE: solo admin
router.delete('/:id', verifyToken, checkRole('admin'), deleteProperty);

module.exports = router;
