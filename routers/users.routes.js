const express = require('express');
const router = express.Router();
const userController = require('../controllers/users.controller');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

router.get('/', verifyToken, checkRole('admin'), userController.getUsuarios);

router.get('/:id', verifyToken, checkRole('admin', 'cliente', 'agente'), userController.getUsuarioById);

router.post('/', verifyToken, checkRole('admin'), userController.createUsuario);

router.put('/:id', verifyToken, checkRole('admin'), userController.updateUsuario);

router.delete('/:id', verifyToken, checkRole('admin'), userController.deleteUsuario);

module.exports = router;
