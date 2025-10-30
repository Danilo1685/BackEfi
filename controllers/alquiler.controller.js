const { Alquiler, Propiedad, Cliente, Usuario } = require('../models');


const getAllAlquileres = async (req, res) => {
    try {
        const alquileres = await Alquiler.findAll({ 
            where: { activo: true },
            include: [
                { 
                    model: Propiedad,
                    attributes: ['id', 'direccion', 'precio', 'estado', 'descripcion']
                },
                {
                    model: Cliente,
                    attributes: ['id', 'documento_identidad', 'telefono'],
                    include: [
                        {
                            model: Usuario,
                            attributes: ['id', 'nombre', 'email']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
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


const getSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await Alquiler.findAll({ 
            where: { 
                activo: true,
                estado: 'pendiente'
            },
            include: [
                { 
                    model: Propiedad,
                    attributes: ['id', 'direccion', 'precio', 'estado', 'descripcion']
                },
                {
                    model: Cliente,
                    attributes: ['id', 'documento_identidad', 'telefono'],
                    include: [
                        {
                            model: Usuario,
                            attributes: ['id', 'nombre', 'email']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'ASC']]
        });
        res.json({ status: 200, data: solicitudes });
    } catch (error) {
        console.error('Error al obtener solicitudes pendientes:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener solicitudes pendientes', 
            error: error.message 
        });
    }
};


const aprobarSolicitud = async (req, res) => {
    try {
        const alquiler = await Alquiler.findOne({
            where: { 
                id: req.params.id,
                activo: true,
                estado: 'pendiente'
            }
        });

        if (!alquiler) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Solicitud no encontrada o ya fue procesada' 
            });
        }

        // Verificar que la propiedad siga disponible
        const propiedad = await Propiedad.findByPk(alquiler.id_propiedad);
        if (!propiedad || propiedad.estado !== 'disponible') {
            return res.status(400).json({
                status: 400,
                message: 'La propiedad ya no está disponible'
            });
        }

        // Actualizar alquiler a activo
        alquiler.estado = 'activo';
        await alquiler.save();

        // Actualizar estado de la propiedad
        propiedad.estado = 'alquilada';
        await propiedad.save();

        // Cargar relaciones para la respuesta
        const alquilerWithRelations = await Alquiler.findOne({
            where: { id: alquiler.id },
            include: [
                { 
                    model: Propiedad,
                    attributes: ['id', 'direccion', 'precio', 'estado']
                },
                {
                    model: Cliente,
                    attributes: ['id', 'documento_identidad', 'telefono'],
                    include: [
                        {
                            model: Usuario,
                            attributes: ['id', 'nombre', 'email']
                        }
                    ]
                }
            ]
        });

        res.json({ 
            status: 200, 
            data: alquilerWithRelations, 
            message: 'Solicitud aprobada exitosamente' 
        });
    } catch (error) {
        console.error('Error al aprobar solicitud:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al aprobar solicitud', 
            error: error.message 
        });
    }
};


const rechazarSolicitud = async (req, res) => {
    try {
        const alquiler = await Alquiler.findOne({
            where: { 
                id: req.params.id,
                activo: true,
                estado: 'pendiente'
            }
        });

        if (!alquiler) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Solicitud no encontrada o ya fue procesada' 
            });
        }

        // Cambiar estado a cancelado
        alquiler.estado = 'cancelado';
        await alquiler.save();

        res.json({ 
            status: 200, 
            message: 'Solicitud rechazada exitosamente' 
        });
    } catch (error) {
        console.error('Error al rechazar solicitud:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al rechazar solicitud', 
            error: error.message 
        });
    }
};


const getAlquilerByClient = async (req, res) => {
    try {
        const alquileres = await Alquiler.findAll({ 
            where: { 
                id_cliente: req.params.clientId,
                activo: true
            }, 
            include: [
                { 
                    model: Propiedad,
                    attributes: ['id', 'direccion', 'precio', 'estado', 'descripcion']
                },
                {
                    model: Cliente,
                    attributes: ['id', 'documento_identidad', 'telefono'],
                    include: [
                        {
                            model: Usuario,
                            attributes: ['id', 'nombre', 'email']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
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
                activo: true
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

        const cliente = await Cliente.findOne({
            where: {
                id: id_cliente,
                activo: true
            }
        });
        if (!cliente) {
            return res.status(404).json({
                status: 404,
                message: 'Cliente no encontrado o inactivo'
            });
        }

        // ✅ Crear como PENDIENTE (solicitud)
        const alquiler = await Alquiler.create({
            id_propiedad,
            id_cliente,
            fecha_inicio,
            fecha_fin,
            monto_mensual,
            estado: 'pendiente',
            activo: true
        });

        // Cargar relaciones para la respuesta
        const alquilerWithRelations = await Alquiler.findOne({
            where: { id: alquiler.id },
            include: [
                { 
                    model: Propiedad,
                    attributes: ['id', 'direccion', 'precio', 'estado']
                },
                {
                    model: Cliente,
                    attributes: ['id', 'documento_identidad', 'telefono'],
                    include: [
                        {
                            model: Usuario,
                            attributes: ['id', 'nombre', 'email']
                        }
                    ]
                }
            ]
        });

        res.status(201).json({ 
            status: 201, 
            data: alquilerWithRelations, 
            message: 'Solicitud de alquiler creada exitosamente' 
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

        // Cargar relaciones para la respuesta
        const alquilerWithRelations = await Alquiler.findOne({
            where: { id: alquiler.id },
            include: [
                { 
                    model: Propiedad,
                    attributes: ['id', 'direccion', 'precio', 'estado']
                },
                {
                    model: Cliente,
                    attributes: ['id', 'documento_identidad', 'telefono'],
                    include: [
                        {
                            model: Usuario,
                            attributes: ['id', 'nombre', 'email']
                        }
                    ]
                }
            ]
        });

        res.json({ 
            status: 200, 
            data: alquilerWithRelations, 
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

        const propiedad = await Propiedad.findByPk(alquiler.id_propiedad);
        if (propiedad && propiedad.estado === 'alquilada') {
            propiedad.estado = 'disponible';
            await propiedad.save();
        }

        alquiler.activo = false;
        alquiler.estado = 'cancelado';
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


const deleteAlquilerPermanente = async (req, res) => {
    try {
        const alquiler = await Alquiler.findByPk(req.params.id);
        if (!alquiler) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Alquiler no encontrado' 
            });
        }

        const propiedad = await Propiedad.findByPk(alquiler.id_propiedad);
        if (propiedad && propiedad.estado === 'alquilada') {
            propiedad.estado = 'disponible';
            await propiedad.save();
        }

        await alquiler.destroy();

        res.json({ 
            status: 200, 
            message: '⚠️ Alquiler eliminado permanentemente de la base de datos' 
        });
    } catch (error) {
        console.error('Error al eliminar alquiler permanentemente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al eliminar alquiler permanentemente', 
            error: error.message 
        });
    }
};

module.exports = {
    getAllAlquileres,
    getSolicitudesPendientes,
    aprobarSolicitud,
    rechazarSolicitud,
    getAlquilerByClient,
    createAlquiler,
    updateAlquiler,
    deleteAlquiler,
    deleteAlquilerPermanente
};