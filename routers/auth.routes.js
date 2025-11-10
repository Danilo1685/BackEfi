const express = require('express');
const router = express.Router();
const { register, login, verifySession, forgotPassword, resetPassword} = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// Registro y login
router.post('/register', register);
router.post('/login', login);

// Ruta protegida (opcional, para validar sesión)
router.get('/verify', verifyToken, verifySession);

router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword', resetPassword);

module.exports = router;
