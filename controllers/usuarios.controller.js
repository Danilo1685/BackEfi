const { User } = require('../models');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ status: 200, data: users });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener usuarios', error: error.message });
    }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'Usuario no encontrado' });
        }
        res.json({ status: 200, data: user });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener usuario', error: error.message });
    }
};

// Crear new usuario
const createUser = async (req, res) => {
    const { name, email, age } = req.body;
    try {
        if (!name || !email || !age) {
            return res.status(400).json({ status: 400, message: 'Faltan campos obligatorios' });
        }

        const newUser = await User.create({ name, email, age });
        res.status(201).json({ status: 201, data: newUser, message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al crear usuario', error: error.message });
    }
};

// Editar usuario
const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'Usuario no encontrado' });
        }

        const { name, email, age } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.age = age || user.age;

        await user.save();

        res.status(200).json({ status: 200, message: 'Usuario editado exitosamente', data: user });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al editar usuario', error: error.message });
    }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'Usuario no encontrado' });
        }

        await user.destroy();

        res.status(200).json({ status: 200, message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al eliminar usuario', error: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};
