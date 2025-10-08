const { Propiedad, TipoPropiedad, Usuario } = require('../models');

const getProperties = async (req, res) => {
    try {
        let whereCondition = { activo: true }; // ⭐ Solo activas
        
        if (req.user.rol === 'cliente') {
            whereCondition.estado = 'disponible';
        }

        const properties = await Propiedad.findAll({ 
            where: whereCondition,
            include: [
                { model: TipoPropiedad, attributes: ['id', 'nombre'] },
                { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'email'] }
            ]
        });
        res.json({ status: 200, data: properties });
    } catch (error) {
        console.error('Error al obtener propiedades:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener propiedades', 
            error: error.message 
        });
    }
};

const getPropertyById = async (req, res) => {
    try {
        const property = await Propiedad.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            },
            include: [
                { model: TipoPropiedad, attributes: ['id', 'nombre'] },
                { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'email'] }
            ]
        });
        if (!property) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Propiedad no encontrada' 
            });
        }
        res.json({ status: 200, data: property });
    } catch (error) {
        console.error('Error al obtener propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener propiedad', 
            error: error.message 
        });
    }
};

const createProperty = async (req, res) => {
    try {
        const { direccion, precio, estado, descripcion, tamaño, tipo_id } = req.body;
        
        if (!direccion || !precio || !tipo_id) {
            return res.status(400).json({
                status: 400,
                message: 'Faltan campos obligatorios (direccion, precio, tipo_id)'
            });
        }

        const newProperty = await Propiedad.create({ 
            direccion, 
            precio,
            estado: estado || 'disponible',
            descripcion,
            tamaño,
            tipo_id,
            id_agente: req.userId,
            activo: true // ⭐ Por defecto activa
        });

        res.status(201).json({ 
            status: 201, 
            data: newProperty, 
            message: 'Propiedad creada exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al crear propiedad', 
            error: error.message 
        });
    }
};

const updateProperty = async (req, res) => {
    try {
        const property = await Propiedad.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!property) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Propiedad no encontrada' 
            });
        }

        const { direccion, precio, estado, descripcion, tamaño, tipo_id } = req.body;
        
        if (direccion) property.direccion = direccion;
        if (precio) property.precio = precio;
        if (estado) property.estado = estado;
        if (descripcion !== undefined) property.descripcion = descripcion;
        if (tamaño !== undefined) property.tamaño = tamaño;
        if (tipo_id) property.tipo_id = tipo_id;

        await property.save();

        res.json({ 
            status: 200, 
            data: property, 
            message: 'Propiedad actualizada exitosamente' 
        });
    } catch (error) {
        console.error('Error al actualizar propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al actualizar propiedad', 
            error: error.message 
        });
    }
};

// ⭐ ELIMINACIÓN LÓGICA
const deleteProperty = async (req, res) => {
    try {
        const property = await Propiedad.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!property) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Propiedad no encontrada' 
            });
        }

        property.activo = false;
        await property.save();

        res.json({ 
            status: 200, 
            message: 'Propiedad desactivada exitosamente' 
        });
    } catch (error) {
        console.error('Error al desactivar propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al desactivar propiedad', 
            error: error.message 
        });
    }
};

module.exports = {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty
};