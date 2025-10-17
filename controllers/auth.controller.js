const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models'); // ✅ Asegurate que sea Usuario, no User

const register = async (req, res) => {
    const { name, email, edad, password, rol } = req.body;

    try {
        const userExist = await Usuario.findOne({ where: { email } });
        if (userExist) {
            return res.status(400).json({ 
                message: 'El usuario ya existe' 
            });
        }

        const newUser = await Usuario.create({
            nombre: name,     
            email,
            edad,      
            password,   
            rol: rol || 'cliente',
            activo: true
        });

        const userResponse = {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email,
            edad: newUser.edad,
            rol: newUser.rol
        };

        res.status(201).json({ 
            message: 'Usuario registrado exitosamente', 
            data: userResponse 
        });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al crear el usuario', 
            error: error.message 
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar usuario activo
        const userExist = await Usuario.findOne({ 
            where: { 
                email,
                activo: true 
            } 
        });
        
        if (!userExist) {
            return res.status(400).json({ 
                message: 'Usuario no encontrado' 
            });
        }

        // Comparar contraseña
        const validPassword = await bcrypt.compare(password, userExist.password);
        if (!validPassword) {
            return res.status(403).json({ 
                message: 'Contraseña incorrecta' 
            });
        }

        // Generar token JWT (válido por 8 horas)
        const token = jwt.sign(
            { id: userExist.id, rol: userExist.rol },
            process.env.JWT_SECRET || 'secreto1234',
            { expiresIn: '8h' } // ✅ Aumentado a 8 horas
        );

        // Datos del usuario para la respuesta
        const user = {
            id: userExist.id,
            nombre: userExist.nombre,  
            email: userExist.email,
            edad: userExist.edad,     
            rol: userExist.rol
        };

        res.json({ 
            message: 'Inicio de sesión exitoso', 
            token, 
            user 
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al iniciar sesión', 
            error: error.message 
        });
    }
};

// ✅ Nueva función para verificar sesión
const verifySession = async (req, res) => {
    try {
        // El middleware verifyToken ya validó el token y agregó req.user
        const user = {
            id: req.user.id,
            nombre: req.user.nombre,
            email: req.user.email,
            edad: req.user.edad,
            rol: req.user.rol
        };
        
        res.json({ 
            valid: true, 
            user 
        });
    } catch (error) {
        console.error('Error en verifySession:', error);
        res.status(401).json({ 
            valid: false, 
            message: 'Sesión inválida' 
        });
    }
};

// ✅ Exportar todas las funciones
module.exports = { register, login, verifySession };