const { Alquiler, Propiedad, Cliente } = require('../models');

const createAlquiler = async (req, res) => {
    try {
        const { id_propiedad, id_cliente, fecha_inicio, fecha_fin, monto_mensual } = req.body;
        
        if (!id_propiedad || !id_cliente || !fecha_inicio || !fecha_fin || !monto_mensual) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Faltan campos obligatorios' 
            });
        }

        const propiedad = await Propiedad.findOne({
            where: { 
                id: id_propiedad,
                activo: true // ⭐ Solo propiedades activas
            }
        });
        if (!propiedad) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Propiedad no encontrada o inactiva' 
            });
        }
        if (propiedad.estado !== 'disponible') {
            return res.status(400).json({ 
                status: 400, 
                message: 'La propiedad no está disponible para alquiler' 
            });
        }

        const alquiler = await Alquiler.create({
            id_propiedad,
            id_cliente,
            fecha_inicio,
            fecha_fin,
            monto_mensual,
            estado: 'activo',
            activo: true // ⭐ Por defecto activo
        });

        propiedad.estado = 'alquilada';
        await propiedad.save();

        res.status(201).json({ 
            status: 201, 
            data: alquiler, 
            message: 'Alquiler creado exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear alquiler:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al crear alquiler', 
            error: error.message 
        });
    }
};

const getAlquilerByUser = async (req, res) => {
    try {
        const alquileres = await Alquiler.findAll({ 
            where: { 
                id_cliente: req.params.id_usuario,
                activo: true // ⭐ Solo alquileres activos
            }, 
            include: [
                { 
                    model: Propiedad,
                    attributes: ['id', 'direccion', 'precio', 'estado', 'descripcion']
                },
                {
                    model: Cliente,
                    attributes: ['id', 'documento_identidad', 'telefono']
                }
            ]
        });
        res.json({ status: 200, data: alquileres });
    } catch (error) {
        console.error('Error al obtener alquileres:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener alquileres', 
            error: error.message 
        });
    }
};

const updateAlquiler = async (req, res) => {
    try {
        const alquiler = await Alquiler.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!alquiler) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Alquiler no encontrado' 
            });
        }

        const { estado, fecha_inicio, fecha_fin, monto_mensual } = req.body;
        
        if (estado) alquiler.estado = estado;
        if (fecha_inicio) alquiler.fecha_inicio = fecha_inicio;
        if (fecha_fin) alquiler.fecha_fin = fecha_fin;
        if (monto_mensual) alquiler.monto_mensual = monto_mensual;

        await alquiler.save();

        // Si se finaliza o cancela el alquiler, actualizar estado de la propiedad
        if (estado === 'finalizado' || estado === 'cancelado') {
            const propiedad = await Propiedad.findByPk(alquiler.id_propiedad);
            if (propiedad && propiedad.estado === 'alquilada') {
                propiedad.estado = 'disponible';
                await propiedad.save();
            }
        }

        res.json({ 
            status: 200, 
            data: alquiler, 
            message: 'Alquiler actualizado exitosamente' 
        });
    } catch (error) {
        console.error('Error al actualizar alquiler:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al actualizar alquiler', 
            error: error.message 
        });
    }
};

// ⭐ ELIMINACIÓN LÓGICA
const deleteAlquiler = async (req, res) => {
    try {
        const alquiler = await Alquiler.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!alquiler) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Alquiler no encontrado' 
            });
        }

        // Actualizar estado de la propiedad antes de desactivar
        const propiedad = await Propiedad.findByPk(alquiler.id_propiedad);
        if (propiedad && propiedad.estado === 'alquilada') {
            propiedad.estado = 'disponible';
            await propiedad.save();
        }

        alquiler.activo = false;
        await alquiler.save();

        res.json({ 
            status: 200, 
            message: 'Alquiler desactivado exitosamente' 
        });
    } catch (error) {
        console.error('Error al desactivar alquiler:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al desactivar alquiler', 
            error: error.message 
        });
    }
};

module.exports = {
    createAlquiler,
    getAlquilerByUser,
    updateAlquiler,
    deleteAlquiler
};
