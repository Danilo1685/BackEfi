const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const auth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            message: 'Token requerido' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto1234');
        const user = await Usuario.findByPk(decoded.id);
        
        if (!user || !user.activo) {
            return res.status(401).json({ 
                message: 'Usuario no encontrado o inactivo' 
            });
        }

        req.user = user; // guardamos el usuario en la request
        next();
    } catch (error) {
        res.status(403).json({ 
            message: 'Token inválido' 
        });
    }
};

module.exports = auth;