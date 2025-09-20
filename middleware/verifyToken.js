const jwt = require('jsonwebtoken');
const { User } = require('../models');

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: 'Token requerido' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Token requerido' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto1234');

        // Opcional: cargar el usuario completo desde la base de datos
        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

        // Guardamos datos del usuario en la request
        req.user = user;       // objeto completo
        req.userId = user.id;  // id
        req.userRol = user.rol; // rol
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = verifyToken;
