const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario, Cliente } = require('../models');
const { ValidationError } = require('sequelize');

// Función auxiliar para manejar errores
const handleValidationError = (error) => {
    if (error instanceof ValidationError) {
        const messages = error.errors.map(err => err.message);
        return {
            status: 400,
            message: 'Error de validación',
            errors: messages
        };
    }
    return {
        status: 500,
        message: 'Error interno del servidor',
        error: error.message
    };
};

// REGISTER - Registro de usuarios
const register = async (req, res) => {
    const { name, email, edad, password, rol, documento_identidad, telefono } = req.body;
    
    try {
        // Validación básica de campos requeridos
        if (!name || !email || !password) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Faltan campos obligatorios',
                errors: [
                    !name && 'El nombre es obligatorio',
                    !email && 'El email es obligatorio',
                    !password && 'La contraseña es obligatoria'
                ].filter(Boolean)
            });
        }

        // ⭐ VALIDACIÓN DE FORMATO DE EMAIL CON REGEX (MÁS ESTRICTA)
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const emailTrimmed = email.trim().toLowerCase();
        
        if (!emailRegex.test(emailTrimmed)) {
            return res.status(400).json({
                status: 400,
                message: 'Formato de email inválido',
                errors: ['El email debe tener un formato válido con @ y dominio completo (ejemplo: usuario@dominio.com)']
            });
        }

        // Validación adicional de contraseña
        if (password.length < 6) {
            return res.status(400).json({
                status: 400,
                message: 'Contraseña inválida',
                errors: ['La contraseña debe tener al menos 6 caracteres']
            });
        }

        // Validación de edad si se proporciona
        if (edad !== undefined && edad !== null) {
            if (typeof edad !== 'number' || edad < 18 || edad > 120) {
                return res.status(400).json({
                    status: 400,
                    message: 'Edad inválida',
                    errors: ['La edad debe ser un número entre 18 y 120 años']
                });
            }
        }

        // Verificar si el email ya existe
        const userExist = await Usuario.findOne({ where: { email: emailTrimmed } });
        if (userExist) {
            return res.status(400).json({ 
                status: 400,
                message: 'Email duplicado',
                errors: ['Este email ya está registrado en el sistema']
            });
        }

        // Crear usuario
        const newUser = await Usuario.create({
            nombre: name,     
            email: emailTrimmed,
            edad,      
            password,   
            rol: rol || 'cliente',
            activo: true
        });

        // ✅ Si el rol es 'cliente', crear automáticamente el registro en la tabla Cliente
        if ((rol || 'cliente') === 'cliente') {
            await Cliente.create({
                documento_identidad: documento_identidad || emailTrimmed,
                telefono: telefono || null,
                id_usuario: newUser.id,
                activo: true
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            { 
                id: newUser.id, 
                rol: newUser.rol 
            },
            process.env.JWT_SECRET || 'secreto1234',
            { expiresIn: '8h' }
        );

        // Respuesta sin contraseña
        const userResponse = {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email,
            edad: newUser.edad,
            rol: newUser.rol
        };

        res.status(201).json({ 
            status: 201,
            message: 'Usuario registrado exitosamente',
            data: userResponse,
            token
        });

    } catch (error) {
        console.error('Error en register:', error);
        const errorResponse = handleValidationError(error);
        res.status(errorResponse.status).json(errorResponse);
    }
};

// LOGIN - Inicio de sesión
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validación de campos requeridos
        if (!email || !password) {
            return res.status(400).json({
                status: 400,
                message: 'Email y contraseña son obligatorios',
                errors: [
                    !email && 'El email es obligatorio',
                    !password && 'La contraseña es obligatoria'
                ].filter(Boolean)
            });
        }

        // ⭐ VALIDACIÓN DE FORMATO DE EMAIL
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const emailTrimmed = email.trim().toLowerCase();
        
        if (!emailRegex.test(emailTrimmed)) {
            return res.status(400).json({
                status: 400,
                message: 'Formato de email inválido',
                errors: ['El email debe tener un formato válido con @ y dominio completo (ejemplo: usuario@dominio.com)']
            });
        }

        // Buscar usuario activo
        const userExist = await Usuario.findOne({ 
            where: { 
                email: emailTrimmed,
                activo: true 
            } 
        });
        
        if (!userExist) {
            return res.status(401).json({ 
                status: 401,
                message: 'Credenciales incorrectas',
                errors: ['Email o contraseña incorrectos']
            });
        }

        // Comparar contraseña
        const validPassword = await bcrypt.compare(password, userExist.password);
        if (!validPassword) {
            return res.status(401).json({ 
                status: 401,
                message: 'Credenciales incorrectas',
                errors: ['Email o contraseña incorrectos']
            });
        }

        // Generar token JWT (válido por 8 horas)
        const token = jwt.sign(
            { id: userExist.id, rol: userExist.rol },
            process.env.JWT_SECRET || 'secreto1234',
            { expiresIn: '8h' }
        );

        // Datos del usuario para la respuesta
        const user = {
            id: userExist.id,
            nombre: userExist.nombre,  
            email: userExist.email,
            edad: userExist.edad,     
            rol: userExist.rol
        };

        // ✅ Si es cliente, incluir también el clienteId
        if (userExist.rol === 'cliente') {
            const cliente = await Cliente.findOne({
                where: { 
                    id_usuario: userExist.id,
                    activo: true 
                }
            });
            if (cliente) {
                user.clienteId = cliente.id;
            }
        }

        res.status(200).json({ 
            status: 200,
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

// ✅ Verificar sesión
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

        // ✅ Si es cliente, incluir también el clienteId
        if (req.user.rol === 'cliente') {
            const cliente = await Cliente.findOne({
                where: { 
                    id_usuario: req.user.id,
                    activo: true 
                }
            });
            if (cliente) {
                user.clienteId = cliente.id;
            }
        }
        
        res.status(200).json({ 
            status: 200,
            valid: true, 
            user 
        });
    } catch (error) {
        console.error('Error en verifySession:', error);
        res.status(401).json({ 
            status: 401,
            valid: false, 
            message: 'Sesión inválida' 
        });
    }
};

// ✅ Exportar todas las funciones
module.exports = { register, login, verifySession };