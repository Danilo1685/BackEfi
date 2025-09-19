const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const register = async (req, res) => {

    const { nombre, email, edad, password, rol } = req.body

    try {
        const userExist = await Usuario.findOne({ where: { email } })
        if (userExist) return res.status(400).json({ message: 'El usuario ya existe' })

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await Usuario.create(
            {
                nombre,
                email,
                edad,
                password: hashedPassword,
                rol: rol || 'cliente'
            })

        res.status(201).json({ message: 'Usuario registrado exitosamente', data: newUser })
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al crear el usuario', error: error.message });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body

    try {
        const userExist = await Usuario.findOne({ where: { email } })
        if (!userExist) return res.status(400).json({ message: 'Usuario no encontrado' })

        const validPassword = await bcrypt.compare(password, userExist.password)
        if (!validPassword) return res.status(403).json({ message: 'Contraseña incorrecta' })

        const token = jwt.sign({ id: userExist.id, rol: userExist.rol }, 'secreto1234', { expiresIn: '1h' })

        const user= {
            id: userExist.id,
            nombre: userExist.nombre,
            email: userExist.email,
            edad: userExist.edad,
            rol: userExist.rol
        }

        res.json({ message: 'Inicio de sesion exitoso', token, user: user })
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al loguear el usuario', error: error.message });
    }
}

module.exports = { register, login }