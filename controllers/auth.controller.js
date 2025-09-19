const bcrypt = require('bcrypt')
const crypto = require('crypto')
const { Usuario } = require('../models')
const jwt = require('jsonwebtoken')
const { sendEmail } = require('../utils/mailer')


const register = async (req, res) => {
    const { nombre, email, edad, password, rol } = req.body;

    console.log("REQ BODY register:", req.body);

    try {
        // Validar campos obligatorios
        if (!nombre || !email || !password || !edad) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        // Verificar si el usuario ya existe
        const userExist = await Usuario.findOne({ where: { email } });
        if (userExist) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const newUser = await Usuario.create({
            nombre,
            email,
            edad,
            password: hashedPassword,
            rol: rol || 'cliente' // rol por defecto
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente', data: newUser });

    } catch (error) {
        console.error("Error en register:", error);
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
};

// ==========================
// Login de usuario
// ==========================
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const userExist = await Usuario.findOne({ where: { email } });
        if (!userExist) return res.status(400).json({ message: 'Usuario no encontrado' });

        const validPassword = await bcrypt.compare(password, userExist.password);
        if (!validPassword) return res.status(403).json({ message: 'Contraseña incorrecta' });

        const user = {
            id: userExist.id,
            nombre: userExist.nombre,
            email: userExist.email,
            edad: userExist.edad,
            rol: userExist.rol
        };

        // 🔑 Generar token JWT (expira en 1h)
        const token = jwt.sign({ user }, 'secreto1234', { expiresIn: '1h' });

        res.json({ message: 'Inicio de sesión exitoso', data: user, token });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: 'Error al loguear el usuario', error: error.message });
    }
};
const resetTokens = new Map()

const resetEmailTemplate = ({ nombre, resetUrl }) => {
    return `
    <div style="max-width: 520px; margin:0; padding: 20px;">
        <h2>Recupera tu contraseña</h2>
        <p>Hola ${nombre || ''}, recibimos tu solicitud para restablecer la contraseña.</p>
        <p>Hace click en el boton para continuar.</p>
        <p>
            <a href=${resetUrl}>
                Cambiar contraseña
            </a>
        </p>
        <p>Si no fuiste vos, podes ignorar el mensaje</p>
    </div>
    `
}

const forgotPassword = async (req, res) => {
    const { email } = req.body

    try {
        const user = await Usuario.findOne({ where: { email } })
        if (!user) return res.status(400).json({ message: 'El usuario no existe' })

        const rawToken = crypto.randomBytes(32).toString('hex')
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
        const expiresAt = Date.now() + 15 * 60 * 1000

        resetTokens.set(user.id, { tokenHash, expiresAt })

        const resetUrl = `${process.env.FRONT_URL || 'http://localhost:5173'}/recuperar-contraseña?token=${rawToken}&id=${user.id}`

        await sendEmail({
            to:user.email,
            subject: 'Recuperar contraseña',
            html: resetEmailTemplate({ nombre: user.nombre, resetUrl })
        })


    } catch (error) {
        return res.status(500).json({ message: 'Error al enviar el mail', error: error.message })
    }
}

const resetPassword = async (req, res) => {
    const { id, token, password } = req.body
    if (!id || !token || !password) return res.status(400).json({ message: 'Faltan datos' })
    try {
        const entry = resetTokens.get(Number(id))
        if (!entry) return res.status(400).json({ message: 'Token invalido' })

        if (entry.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Token invalido' })
        }

        const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

        if (tokenHash !== entry.tokenHash) return res.status(400).json({ message: 'Token invalido' })

        const user = await Usuario.findByPk(id)
        if (!user) return res.status(400).json({ message: 'El usuario no existe' })

        user.password = await bcrypt.hash(password, 10)
        await user.save()

        resetTokens.delete(Number(id))

        return res.status(201).json({ message: 'Contraseña actualizada exitosamente' })

    } catch (error) {
        return res.status(500).json({ message: 'Error al resetear contraseña' })
    }
}



module.exports = { register, login, forgotPassword, resetPassword }

