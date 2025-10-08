const { Localidad } = require('../models');

const getLocalidades = async (req, res) => {
    try {
        const localidades = await Localidad.findAll();
        res.json({ status: 200, data: localidades });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener localidades', error: error.message });
    }
};

const getLocalidadById = async (req, res) => {
    try {
        const localidad = await Localidad.findByPk(req.params.id);
        if (!localidad) return res.status(404).json({ message: 'Localidad no encontrada' });
        res.json({ status: 200, data: localidad });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener localidad', error: error.message });
    }
};

const createLocalidad = async (req, res) => {
    try {
        const { nombre, provincia_id } = req.body;
        if (!nombre || !provincia_id) return res.status(400).json({ message: 'Faltan campos' });

        const localidad = await Localidad.create({ nombre, provincia_id });
        res.status(201).json({ message: 'Localidad creada', data: localidad });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear localidad', error: error.message });
    }
};

const updateLocalidad = async (req, res) => {
    try {
        const localidad = await Localidad.findByPk(req.params.id);
        if (!localidad) return res.status(404).json({ message: 'Localidad no encontrada' });

        localidad.nombre = req.body.nombre || localidad.nombre;
        localidad.provincia_id = req.body.provincia_id || localidad.provincia_id;
        await localidad.save();
        res.json({ message: 'Localidad actualizada', data: localidad });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar localidad', error: error.message });
    }
};

const deleteLocalidad = async (req, res) => {
    try {
        const localidad = await Localidad.findByPk(req.params.id);
        if (!localidad) return res.status(404).json({ message: 'Localidad no encontrada' });

        await localidad.destroy();
        res.json({ message: 'Localidad eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar localidad', error: error.message });
    }
};

module.exports = { getLocalidades, getLocalidadById, createLocalidad, updateLocalidad, deleteLocalidad };
