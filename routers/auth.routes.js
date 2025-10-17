const express = require('express');
const router = express.Router();
const { register, login, verifySession } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// Registro y login
router.post('/register', register);
router.post('/login', login);

// Ruta protegida (opcional, para validar sesión)
router.get('/verify', verifyToken, verifySession);

module.exports = router;
