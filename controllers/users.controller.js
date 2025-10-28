const { Usuario } = require('../models');

// ========================================
// USUARIOS ACTIVOS
// ========================================

// Obtener todos los usuarios ACTIVOS
const getUsuarios = async (req, res) => {
    try {
        const users = await Usuario.findAll({
            where: { activo: true },
            attributes: { exclude: ['password'] }
        });
        res.json({ status: 200, data: users });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener usuarios', 
            error: error.message 
        });
    }
};

// Obtener usuario por ID (solo si está activo)
const getUsuarioById = async (req, res) => {
    try {
        const user = await Usuario.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            },
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Usuario no encontrado' 
            });
        }
        res.json({ status: 200, data: user });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener usuario', 
            error: error.message 
        });
    }
};

// Crear nuevo usuario
const createUsuario = async (req, res) => {
    const { nombre, email, edad, password, rol } = req.body;
    try {
        if (!nombre || !email || !password) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Faltan campos obligatorios (nombre, email, password)' 
            });
        }

        // Verificar si el email ya existe (incluyendo usuarios inactivos)
        const existingUser = await Usuario.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                status: 400,
                message: 'El email ya está registrado'
            });
        }

        const newUser = await Usuario.create({ 
            nombre, 
            email, 
            edad,
            password,
            rol: rol || 'cliente',
            activo: true
        });

        // No devolver la contraseña
        const userResponse = {
            id: newUser.id,
            nombre: newUser.nombre,
            email: newUser.email,
            edad: newUser.edad,
            rol: newUser.rol,
            activo: newUser.activo
        };

        res.status(201).json({ 
            status: 201, 
            data: userResponse, 
            message: 'Usuario creado exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al crear usuario', 
            error: error.message 
        });
    }
};

// Editar usuario
const updateUsuario = async (req, res) => {
    try {
        const user = await Usuario.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!user) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Usuario no encontrado' 
            });
        }

        const { nombre, email, edad, password, rol } = req.body;
        
        // Verificar si el email ya está en uso por otro usuario
        if (email && email !== user.email) {
            const existingUser = await Usuario.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({
                    status: 400,
                    message: 'El email ya está en uso'
                });
            }
            user.email = email;
        }

        if (nombre) user.nombre = nombre;
        if (edad !== undefined) user.edad = edad;
        if (password) user.password = password; // El hook del modelo lo hasheará
        if (rol) user.rol = rol;

        await user.save();

        // No devolver la contraseña
        const userResponse = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            edad: user.edad,
            rol: user.rol,
            activo: user.activo
        };

        res.status(200).json({ 
            status: 200, 
            message: 'Usuario editado exitosamente', 
            data: userResponse 
        });
    } catch (error) {
        console.error('Error al editar usuario:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al editar usuario', 
            error: error.message 
        });
    }
};

// ⭐ ELIMINACIÓN LÓGICA (cambiar activo a false)
const deleteUsuario = async (req, res) => {
    try {
        const user = await Usuario.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!user) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Usuario no encontrado' 
            });
        }

        // No permitir que un usuario se desactive a sí mismo
        if (req.userId === user.id) {
            return res.status(400).json({
                status: 400,
                message: 'No puedes desactivar tu propia cuenta'
            });
        }

        user.activo = false;
        await user.save();

        res.status(200).json({ 
            status: 200, 
            message: 'Usuario desactivado exitosamente' 
        });
    } catch (error) {
        console.error('Error al desactivar usuario:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al desactivar usuario', 
            error: error.message 
        });
    }
};

// ========================================
// USUARIOS INACTIVOS (SOLO ADMIN)
// ========================================

// ⭐ NUEVO: Obtener usuarios INACTIVOS
const getUsuariosInactivos = async (req, res) => {
    try {
        const users = await Usuario.findAll({
            where: { activo: false },
            attributes: { exclude: ['password'] },
            order: [['updatedAt', 'DESC']]
        });
        res.json({ status: 200, data: users });
    } catch (error) {
        console.error('Error al obtener usuarios inactivos:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener usuarios inactivos', 
            error: error.message 
        });
    }
};

// ⭐ NUEVO: Restaurar usuario (cambiar activo a true)
const restaurarUsuario = async (req, res) => {
    try {
        const user = await Usuario.findOne({
            where: { 
                id: req.params.id,
                activo: false 
            }
        });

        if (!user) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Usuario no encontrado o ya está activo' 
            });
        }

        user.activo = true;
        await user.save();

        const userResponse = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            edad: user.edad,
            rol: user.rol,
            activo: user.activo
        };

        res.status(200).json({ 
            status: 200, 
            message: 'Usuario restaurado exitosamente',
            data: userResponse
        });
    } catch (error) {
        console.error('Error al restaurar usuario:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al restaurar usuario', 
            error: error.message 
        });
    }
};

// ⭐ NUEVO: Eliminación FÍSICA/PERMANENTE (solo admin)
const deleteUsuarioPermanente = async (req, res) => {
    try {
        const user = await Usuario.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Usuario no encontrado' 
            });
        }

        // No permitir que un admin se elimine a sí mismo
        if (req.userId === user.id) {
            return res.status(400).json({
                status: 400,
                message: 'No puedes eliminar tu propia cuenta'
            });
        }

        // Eliminar físicamente de la base de datos
        await user.destroy();

        res.status(200).json({ 
            status: 200, 
            message: '⚠️ Usuario eliminado permanentemente de la base de datos' 
        });
    } catch (error) {
        console.error('Error al eliminar usuario permanentemente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al eliminar usuario permanentemente', 
            error: error.message 
        });
    }
};

module.exports = {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuariosInactivos,
    restaurarUsuario,
    deleteUsuarioPermanente
};