const express = require('express');
const router = express.Router();
const {
    createAlquiler,
    getAlquilerByUser,
    updateAlquiler,
    deleteAlquiler
} = require('../controllers/alquiler.controller');

const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const { Alquiler } = require('../models');

// Crear alquiler (solo cliente)
router.post('/', verifyToken, checkRole('cliente', 'admin'), createAlquiler);

// Obtener alquileres de un usuario (admin, agente o cliente propio)
router.get('/cliente/:clientId', verifyToken, async (req, res, next) => {
    if (req.user.rol === 'cliente' && req.user.id !== parseInt(req.params.id_usuario)) {
        return res.status(403).json({ message: 'No tienes permiso para ver estos alquileres' });
    }
    next();
}, checkRole('admin', 'agente', 'cliente'), getAlquilerByUser);

// Actualizar alquiler (solo admin o agente)
router.put('/:id', verifyToken, checkRole('admin', 'agente'), updateAlquiler);

// Cancelar alquiler (cliente propio o admin)
router.delete('/:id', verifyToken, async (req, res, next) => {
    const alquiler = await Alquiler.findByPk(req.params.id);
    if (!alquiler) return res.status(404).json({ message: 'Alquiler no encontrado' });

    if (req.user.rol === 'cliente' && alquiler.userId !== req.user.id) {
        return res.status(403).json({ message: 'No puedes cancelar este alquiler' });
    }

    next();
}, checkRole('admin', 'cliente'), deleteAlquiler);

module.exports = router;
