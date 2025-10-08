const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const verifyToken = require('../middleware/verifyToken');

// Registro y login
router.post('/register', register);
router.post('/login', login);

// Ejemplo de ruta protegida
router.get('/profile', verifyToken, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
