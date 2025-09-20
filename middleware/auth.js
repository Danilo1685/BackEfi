const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token requerido' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto1234');
        const user = await User.findByPk(decoded.id);
        if (!user) return res.status(401).json({ message: 'Usuario no encontrado' });

        req.user = user; // guardamos el usuario en la request
        next();
    } catch (error) {
        res.status(403).json({ message: 'Token inválido' });
    }
};

module.exports = auth;
