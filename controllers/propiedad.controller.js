const { Property } = require('../models');

// Obtener todas las propiedades
const getProperties = async (req, res) => {
    try {
        let properties;
        if (req.user.rol === 'cliente') {
            properties = await Property.findAll({ where: { estado: 'disponible' } });
        } else {
            properties = await Property.findAll();
        }
        res.json({ status: 200, data: properties });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener propiedades', error: error.message });
    }
};

// Obtener propiedad por ID
const getPropertyById = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ status: 404, message: 'Propiedad no encontrada' });
        res.json({ status: 200, data: property });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener propiedad', error: error.message });
    }
};

// Crear nueva propiedad (admin o agente)
const createProperty = async (req, res) => {
    try {
        const { nombre, direccion, estado, precio } = req.body;
        const newProperty = await Property.create({ nombre, direccion, estado, precio });
        res.status(201).json({ status: 201, data: newProperty, message: 'Propiedad creada exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al crear propiedad', error: error.message });
    }
};

// Actualizar propiedad (admin o agente)
const updateProperty = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ status: 404, message: 'Propiedad no encontrada' });

        const { nombre, direccion, estado, precio } = req.body;
        property.nombre = nombre || property.nombre;
        property.direccion = direccion || property.direccion;
        property.estado = estado || property.estado;
        property.precio = precio || property.precio;

        await property.save();
        res.json({ status: 200, data: property, message: 'Propiedad actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al actualizar propiedad', error: error.message });
    }
};

// Eliminar propiedad (solo admin)
const deleteProperty = async (req, res) => {
    try {
        const property = await Property.findByPk(req.params.id);
        if (!property) return res.status(404).json({ status: 404, message: 'Propiedad no encontrada' });

        await property.destroy();
        res.json({ status: 200, message: 'Propiedad eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al eliminar propiedad', error: error.message });
    }
};

module.exports = {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
};
