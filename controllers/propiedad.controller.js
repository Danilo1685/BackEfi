const { Propiedad, TipoPropiedad, Usuario, Alquiler, Venta } = require('../models');

// ========================================
// PROPIEDADES ACTIVAS
// ========================================

// GET: Obtener todas las propiedades ACTIVAS
// - Admin/Agente: ven TODAS las propiedades activas
// - Cliente: solo ve las DISPONIBLES
const getProperties = async (req, res) => {
    try {
        let whereCondition = { activo: true };
        
        // Los clientes SOLO ven propiedades disponibles
        if (req.user.rol === 'cliente') {
            whereCondition.estado = 'disponible';
        }

        const properties = await Propiedad.findAll({ 
            where: whereCondition,
            include: [
                { 
                    model: TipoPropiedad, 
                    attributes: ['id', 'nombre'] 
                },
                { 
                    model: Usuario, 
                    as: 'Usuario', 
                    attributes: ['id', 'nombre', 'email'] 
                }
            ],
            order: [['createdAt', 'DESC']]
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

// GET BY ID: Obtener propiedad específica
const getPropertyById = async (req, res) => {
    try {
        let whereCondition = { 
            id: req.params.id,
            activo: true 
        };

        // Clientes solo pueden ver propiedades disponibles
        if (req.user.rol === 'cliente') {
            whereCondition.estado = 'disponible';
        }

        const property = await Propiedad.findOne({
            where: whereCondition,
            include: [
                { 
                    model: TipoPropiedad, 
                    attributes: ['id', 'nombre'] 
                },
                { 
                    model: Usuario, 
                    as: 'Usuario', 
                    attributes: ['id', 'nombre', 'email'] 
                }
            ]
        });

        if (!property) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Propiedad no encontrada o no disponible' 
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

// POST: Crear nueva propiedad (Admin y Agente)
const createProperty = async (req, res) => {
    try {
        const { direccion, precio, estado, descripcion, tamaño, tipo_id } = req.body;
        
        // Validaciones
        if (!direccion || !precio || !tipo_id) {
            return res.status(400).json({
                status: 400,
                message: 'Faltan campos obligatorios (direccion, precio, tipo_id)'
            });
        }

        // Validar que el tipo de propiedad existe
        const tipoExists = await TipoPropiedad.findByPk(tipo_id);
        if (!tipoExists) {
            return res.status(404).json({
                status: 404,
                message: 'El tipo de propiedad seleccionado no existe'
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
            activo: true
        });

        // Cargar relaciones para la respuesta
        const propertyWithRelations = await Propiedad.findOne({
            where: { id: newProperty.id },
            include: [
                { model: TipoPropiedad, attributes: ['id', 'nombre'] },
                { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'email'] }
            ]
        });

        res.status(201).json({ 
            status: 201, 
            data: propertyWithRelations, 
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

// PUT: Actualizar propiedad (Admin y Agente)
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

        // Agentes solo pueden editar sus propias propiedades
        if (req.user.rol === 'agente' && property.id_agente !== req.userId) {
            return res.status(403).json({
                status: 403,
                message: 'No tienes permiso para editar esta propiedad'
            });
        }

        const { direccion, precio, estado, descripcion, tamaño, tipo_id } = req.body;
        
        // Validar tipo_id si se proporciona
        if (tipo_id) {
            const tipoExists = await TipoPropiedad.findByPk(tipo_id);
            if (!tipoExists) {
                return res.status(404).json({
                    status: 404,
                    message: 'El tipo de propiedad seleccionado no existe'
                });
            }
            property.tipo_id = tipo_id;
        }

        // Actualizar campos
        if (direccion) property.direccion = direccion;
        if (precio) property.precio = precio;
        if (estado) property.estado = estado;
        if (descripcion !== undefined) property.descripcion = descripcion;
        if (tamaño !== undefined) property.tamaño = tamaño;

        await property.save();

        // Cargar relaciones para la respuesta
        const propertyWithRelations = await Propiedad.findOne({
            where: { id: property.id },
            include: [
                { model: TipoPropiedad, attributes: ['id', 'nombre'] },
                { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'email'] }
            ]
        });

        res.json({ 
            status: 200, 
            data: propertyWithRelations, 
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

// ⭐ ELIMINACIÓN LÓGICA (Admin y Agente)
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

        // Agentes solo pueden eliminar (desactivar) sus propias propiedades
        if (req.user.rol === 'agente' && property.id_agente !== req.userId) {
            return res.status(403).json({
                status: 403,
                message: 'No tienes permiso para eliminar esta propiedad'
            });
        }

        // Verificar si tiene operaciones activas
        const alquileresActivos = await Alquiler.count({
            where: { 
                id_propiedad: property.id,
                activo: true,
                estado: 'activo'
            }
        });

        const ventasActivas = await Venta.count({
            where: { 
                id_propiedad: property.id,
                activo: true,
                estado: 'finalizada'
            }
        });

        if (alquileresActivos > 0 || ventasActivas > 0) {
            return res.status(400).json({
                status: 400,
                message: 'No se puede desactivar. La propiedad tiene operaciones activas.'
            });
        }

        property.activo = false;
        await property.save();

        res.json({ 
            status: 200, 
            message: 'Propiedad desactivada exitosamente (eliminación lógica)' 
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

// ========================================
// PROPIEDADES INACTIVAS (SOLO ADMIN)
// ========================================

// ⭐ NUEVO: Obtener propiedades INACTIVAS (solo admin)
const getPropertiesInactivas = async (req, res) => {
    try {
        const properties = await Propiedad.findAll({ 
            where: { activo: false },
            include: [
                { 
                    model: TipoPropiedad, 
                    attributes: ['id', 'nombre'] 
                },
                { 
                    model: Usuario, 
                    as: 'Usuario', 
                    attributes: ['id', 'nombre', 'email'] 
                }
            ],
            order: [['updatedAt', 'DESC']]
        });

        res.json({ status: 200, data: properties });
    } catch (error) {
        console.error('Error al obtener propiedades inactivas:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener propiedades inactivas', 
            error: error.message 
        });
    }
};

// ⭐ NUEVO: Restaurar propiedad (cambiar activo a true) - Solo admin
const restaurarProperty = async (req, res) => {
    try {
        const property = await Propiedad.findOne({
            where: { 
                id: req.params.id,
                activo: false 
            }
        });

        if (!property) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Propiedad no encontrada o ya está activa' 
            });
        }

        property.activo = true;
        await property.save();

        // Cargar relaciones para la respuesta
        const propertyWithRelations = await Propiedad.findOne({
            where: { id: property.id },
            include: [
                { model: TipoPropiedad, attributes: ['id', 'nombre'] },
                { model: Usuario, as: 'Usuario', attributes: ['id', 'nombre', 'email'] }
            ]
        });

        res.status(200).json({ 
            status: 200, 
            message: 'Propiedad restaurada exitosamente',
            data: propertyWithRelations
        });
    } catch (error) {
        console.error('Error al restaurar propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al restaurar propiedad', 
            error: error.message 
        });
    }
};

// ⚠️ ELIMINACIÓN FÍSICA (SOLO ADMIN)
const deletePropertyPermanente = async (req, res) => {
    try {
        const property = await Propiedad.findByPk(req.params.id);

        if (!property) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Propiedad no encontrada' 
            });
        }

        // Verificar que NO tenga ninguna operación (activa o inactiva)
        const alquileres = await Alquiler.count({
            where: { id_propiedad: property.id }
        });

        const ventas = await Venta.count({
            where: { id_propiedad: property.id }
        });

        if (alquileres > 0 || ventas > 0) {
            return res.status(400).json({
                status: 400,
                message: 'No se puede eliminar permanentemente. La propiedad tiene operaciones registradas (alquileres o ventas).'
            });
        }

        await property.destroy();

        res.json({ 
            status: 200, 
            message: '⚠️ Propiedad eliminada permanentemente de la base de datos' 
        });
    } catch (error) {
        console.error('Error al eliminar propiedad permanentemente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al eliminar propiedad permanentemente', 
            error: error.message 
        });
    }
};

module.exports = {
    getProperties,
    getPropertyById,
    createProperty,
    updateProperty,
    deleteProperty,
    getPropertiesInactivas,
    restaurarProperty,
    deletePropertyPermanente
};