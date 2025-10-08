const { Pais } = require('../models');

// Obtener todos los países
const getPaises = async (req, res) => {
    try {
        const paises = await Pais.findAll();
        res.json({ status: 200, data: paises });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener países', error: error.message });
    }
};

// Obtener país por ID
const getPaisById = async (req, res) => {
    try {
        const pais = await Pais.findByPk(req.params.id);
        if (!pais) return res.status(404).json({ message: 'País no encontrado' });
        res.json({ status: 200, data: pais });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener país', error: error.message });
    }
};

// Crear país
const createPais = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

        const pais = await Pais.create({ nombre });
        res.status(201).json({ message: 'País creado', data: pais });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear país', error: error.message });
    }
};

// Editar país
const updatePais = async (req, res) => {
    try {
        const pais = await Pais.findByPk(req.params.id);
        if (!pais) return res.status(404).json({ message: 'País no encontrado' });

        pais.nombre = req.body.nombre || pais.nombre;
        await pais.save();
        res.json({ message: 'País actualizado', data: pais });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar país', error: error.message });
    }
};

// Eliminar país
const deletePais = async (req, res) => {
    try {
        const pais = await Pais.findByPk(req.params.id);
        if (!pais) return res.status(404).json({ message: 'País no encontrado' });

        await pais.destroy();
        res.json({ message: 'País eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar país', error: error.message });
    }
};

module.exports = { getPaises, getPaisById, createPais, updatePais, deletePais };
