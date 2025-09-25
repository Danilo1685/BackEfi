const { Alquiler, Property } = require('../models');

// Crear alquiler (cliente)
const createAlquiler = async (req, res) => {
    try {
        const { propertyId } = req.body;
        const alquiler = await Alquiler.create({
            userId: req.userId,
            propertyId,
            estado: 'pendiente'
        });
        res.status(201).json({ status: 201, data: alquiler, message: 'Alquiler creado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al crear alquiler', error: error.message });
    }
};

// Obtener alquileres de un usuario
const getAlquilerByUser = async (req, res) => {
    try {
        const alquileres = await Alquiler.findAll({ where: { userId: req.params.id_usuario }, include: Property });
        res.json({ status: 200, data: alquileres});
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener alquileres', error: error.message });
    }
};

// Actualizar alquiler (admin o agente)
const updateAlquiler = async (req, res) => {
    try {
        const alquiler = await Alquiler.findByPk(req.params.id);
        if (!alquiler) return res.status(404).json({ status: 404, message: 'Alquiler no encontrado' });

        const { estado } = req.body;
        alquiler.estado = estado || alquiler.estado;

        await alquiler.save();
        res.json({ status: 200, data: alquiler, message: 'Alquiler actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al actualizar alquiler', error: error.message });
    }
};

// Cancelar alquiler (cliente o admin)
const deleteAlquiler = async (req, res) => {
    try {
        const alquiler = await Alquiler.findByPk(req.params.id);
        if (!alquiler) return res.status(404).json({ status: 404, message: 'Alquiler no encontrado' });

        await alquiler.destroy();
        res.json({ status: 200, message: 'Alquiler cancelado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al eliminar alquiler', error: error.message });
    }
};

module.exports = {
    createAlquiler,
    getAlquilerByUser,
    updateAlquiler,
    deleteAlquiler
};
