const { TipoPropiedad } = require('../models');

const getTipos = async (req, res) => {
    try {
        const tipos = await TipoPropiedad.findAll({
            where: { activo: true }
        });
        res.json({ status: 200, data: tipos });
    } catch (error) {
        console.error('Error al obtener tipos de propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener tipos de propiedad', 
            error: error.message 
        });
    }
};

const getTipoById = async (req, res) => {
    try {
        const tipo = await TipoPropiedad.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!tipo) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Tipo de propiedad no encontrado' 
            });
        }
        res.json({ status: 200, data: tipo });
    } catch (error) {
        console.error('Error al obtener tipo de propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener tipo de propiedad', 
            error: error.message 
        });
    }
};

const createTipo = async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ 
                status: 400, 
                message: 'El nombre es requerido' 
            });
        }

        // Verificar si ya existe un tipo con ese nombre
        const tipoExistente = await TipoPropiedad.findOne({ 
            where: { nombre } 
        });
        if (tipoExistente) {
            return res.status(400).json({
                status: 400,
                message: 'Ya existe un tipo de propiedad con ese nombre'
            });
        }

        const tipo = await TipoPropiedad.create({ 
            nombre,
            activo: true
        });
        
        res.status(201).json({ 
            status: 201, 
            message: 'Tipo de propiedad creado exitosamente', 
            data: tipo 
        });
    } catch (error) {
        console.error('Error al crear tipo de propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al crear tipo de propiedad', 
            error: error.message 
        });
    }
};

const updateTipo = async (req, res) => {
    try {
        const tipo = await TipoPropiedad.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!tipo) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Tipo de propiedad no encontrado' 
            });
        }

        const { nombre } = req.body;
        if (nombre) {
            // Verificar que el nombre no esté en uso por otro tipo
            const tipoExistente = await TipoPropiedad.findOne({
                where: { nombre }
            });
            if (tipoExistente && tipoExistente.id !== tipo.id) {
                return res.status(400).json({
                    status: 400,
                    message: 'Ya existe un tipo de propiedad con ese nombre'
                });
            }
            tipo.nombre = nombre;
        }

        await tipo.save();

        res.json({ 
            status: 200, 
            message: 'Tipo de propiedad actualizado exitosamente', 
            data: tipo 
        });
    } catch (error) {
        console.error('Error al actualizar tipo de propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al actualizar tipo de propiedad', 
            error: error.message 
        });
    }
};

// ⭐ ELIMINACIÓN LÓGICA (agentes y admin)
const deleteTipo = async (req, res) => {
    try {
        const tipo = await TipoPropiedad.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!tipo) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Tipo de propiedad no encontrado' 
            });
        }

        // Verificar si hay propiedades activas con este tipo
        const { Propiedad } = require('../models');
        const propiedadesActivas = await Propiedad.count({
            where: { 
                tipo_id: tipo.id,
                activo: true 
            }
        });

        if (propiedadesActivas > 0) {
            return res.status(400).json({
                status: 400,
                message: 'No se puede desactivar. Hay propiedades activas con este tipo.'
            });
        }

        tipo.activo = false;
        await tipo.save();

        res.json({ 
            status: 200, 
            message: 'Tipo de propiedad desactivado exitosamente (eliminación lógica)' 
        });
    } catch (error) {
        console.error('Error al desactivar tipo de propiedad:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al desactivar tipo de propiedad', 
            error: error.message 
        });
    }
};

// ⚠️ ELIMINACIÓN FÍSICA (SOLO ADMIN)
const deleteTipoPermanente = async (req, res) => {
    try {
        const tipo = await TipoPropiedad.findByPk(req.params.id);
        if (!tipo) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Tipo de propiedad no encontrado' 
            });
        }

        // Verificar si hay propiedades con este tipo (activas o inactivas)
        const { Propiedad } = require('../models');
        const propiedades = await Propiedad.count({
            where: { tipo_id: tipo.id }
        });

        if (propiedades > 0) {
            return res.status(400).json({
                status: 400,
                message: 'No se puede eliminar permanentemente. Hay propiedades registradas con este tipo.'
            });
        }

        await tipo.destroy();

        res.json({ 
            status: 200, 
            message: '⚠️ Tipo de propiedad eliminado permanentemente de la base de datos' 
        });
    } catch (error) {
        console.error('Error al eliminar tipo de propiedad permanentemente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al eliminar tipo de propiedad permanentemente', 
            error: error.message 
        });
    }
};

module.exports = { 
    getTipos, 
    getTipoById,
    createTipo, 
    updateTipo, 
    deleteTipo,
    deleteTipoPermanente 
};