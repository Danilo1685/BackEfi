const { Provincia } = require('../models');

const getProvincias = async (req, res) => {
    try {
        const provincias = await Provincia.findAll();
        res.json({ status: 200, data: provincias });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener provincias', error: error.message });
    }
};

const getProvinciaById = async (req, res) => {
    try {
        const provincia = await Provincia.findByPk(req.params.id);
        if (!provincia) return res.status(404).json({ message: 'Provincia no encontrada' });
        res.json({ status: 200, data: provincia });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener provincia', error: error.message });
    }
};

const createProvincia = async (req, res) => {
    try {
        const { nombre, pais_id } = req.body;
        if (!nombre || !pais_id) return res.status(400).json({ message: 'Faltan campos' });

        const provincia = await Provincia.create({ nombre, pais_id });
        res.status(201).json({ message: 'Provincia creada', data: provincia });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear provincia', error: error.message });
    }
};

const updateProvincia = async (req, res) => {
    try {
        const provincia = await Provincia.findByPk(req.params.id);
        if (!provincia) return res.status(404).json({ message: 'Provincia no encontrada' });

        provincia.nombre = req.body.nombre || provincia.nombre;
        provincia.pais_id = req.body.pais_id || provincia.pais_id;
        await provincia.save();
        res.json({ message: 'Provincia actualizada', data: provincia });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar provincia', error: error.message });
    }
};

const deleteProvincia = async (req, res) => {
    try {
        const provincia = await Provincia.findByPk(req.params.id);
        if (!provincia) return res.status(404).json({ message: 'Provincia no encontrada' });

        await provincia.destroy();
        res.json({ message: 'Provincia eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar provincia', error: error.message });
    }
};

module.exports = { getProvincias, getProvinciaById, createProvincia, updateProvincia, deleteProvincia };
