const { Tipo_propiedad } = require('../models');

const getTipos = async (req, res) => {
    try {
        const tipos = await Tipo_propiedad.findAll();
        res.json({ status: 200, data: tipos });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener tipos de propiedad', error: error.message });
    }
};

const createTipo = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ message: 'El nombre es requerido' });

        const tipo = await Tipo_propiedad.create({ nombre });
        res.status(201).json({ message: 'Tipo de propiedad creado', data: tipo });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear tipo de propiedad', error: error.message });
    }
};

const updateTipo = async (req, res) => {
    try {
        const tipo = await Tipo_propiedad.findByPk(req.params.id);
        if (!tipo) return res.status(404).json({ message: 'Tipo de propiedad no encontrado' });

        tipo.nombre = req.body.nombre || tipo.nombre;
        await tipo.save();
        res.json({ message: 'Tipo de propiedad actualizado', data: tipo });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar tipo de propiedad', error: error.message });
    }
};

const deleteTipo = async (req, res) => {
    try {
        const tipo = await Tipo_propiedad.findByPk(req.params.id);
        if (!tipo) return res.status(404).json({ message: 'Tipo de propiedad no encontrado' });

        await tipo.destroy();
        res.json({ message: 'Tipo de propiedad eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar tipo de propiedad', error: error.message });
    }
};

module.exports = { getTipos, createTipo, updateTipo, deleteTipo };
