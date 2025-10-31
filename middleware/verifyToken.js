const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

/**
 * Middleware para verificar el token JWT en las peticiones
 * Este es el middleware UNIFICADO que reemplaza auth.js y verifyToken.js
 */
const verifyToken = async (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({ 
                message: 'Token requerido' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Token requerido' 
            });
        }

        // Verificar el token
        const decoded = jwt.verify(
            token, 
            process.env.JWT_SECRET || 'secreto1234'
        );

        // Buscar el usuario en la base de datos
        const user = await Usuario.findOne({
            where: { 
                id: decoded.id,
                activo: true 
            },
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({ 
                message: 'Usuario no encontrado o inactivo' 
            });
        }

        // Agregar datos del usuario al request (formato completo para compatibilidad)
        req.user = user;           // Objeto completo del usuario
        req.userId = user.id;      // ID del usuario
        req.userRol = user.rol;    // Rol del usuario

        next();
    } catch (error) {
        console.error('Error en verifyToken:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Token inválido' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expirado' 
            });
        }

        return res.status(500).json({ 
            message: 'Error al verificar token',
            error: error.message 
        });
    }
};

module.exports = verifyToken;