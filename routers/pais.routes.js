const express = require('express');
const router = express.Router();
const {
    getPaises,
    getPaisById,
    createPais,
    updatePais,
    deletePais
} = require('../controllers/paisController');

const verifyToken = require('../middlewares/verifyToken');
const checkRole = require('../middlewares/checkRole');

// Rutas GET: cualquier usuario autenticado puede ver países
router.get('/', verifyToken, checkRole('admin', 'agente', 'cliente'), getPaises);
router.get('/:id', verifyToken, checkRole('admin', 'agente', 'cliente'), getPaisById);

// Rutas de modificación: solo admin
router.post('/', verifyToken, checkRole('admin'), createPais);
router.put('/:id', verifyToken, checkRole('admin'), updatePais);
router.delete('/:id', verifyToken, checkRole('admin'), deletePais);

module.exports = router;
