const { Venta, Propiedad, Cliente, Usuario } = require('../models');

// ========================================
// OBTENER TODAS LAS VENTAS (Admin/Agente)
// ========================================
const getVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            where: { activo: true },
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
                },
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 200, data: ventas });
    } catch (error) {
        console.error('Error al obtener ventas:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener ventas', 
            error: error.message 
        });
    }
};


const getSolicitudesPendientes = async (req, res) => {
    try {
        const solicitudes = await Venta.findAll({
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
                },
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
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

// ========================================
// ✅ NUEVO: APROBAR SOLICITUD
// ========================================
const aprobarSolicitud = async (req, res) => {
    try {
        const venta = await Venta.findOne({
            where: { 
                id: req.params.id,
                activo: true,
                estado: 'pendiente'
            }
        });

        if (!venta) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Solicitud no encontrada o ya fue procesada' 
            });
        }

        // Verificar que la propiedad siga disponible
        const propiedad = await Propiedad.findByPk(venta.id_propiedad);
        if (!propiedad || propiedad.estado !== 'disponible') {
            return res.status(400).json({
                status: 400,
                message: 'La propiedad ya no está disponible'
            });
        }

        // Actualizar venta a finalizada
        venta.estado = 'finalizada';
        venta.usuarioId = req.userId; // Registrar quién aprobó
        await venta.save();

        // Actualizar estado de la propiedad
        propiedad.estado = 'vendida';
        await propiedad.save();

        // Cargar relaciones para la respuesta
        const ventaWithRelations = await Venta.findOne({
            where: { id: venta.id },
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
                },
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
                }
            ]
        });

        res.json({ 
            status: 200, 
            data: ventaWithRelations, 
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

// ========================================
// ✅ NUEVO: RECHAZAR SOLICITUD
// ========================================
const rechazarSolicitud = async (req, res) => {
    try {
        const venta = await Venta.findOne({
            where: { 
                id: req.params.id,
                activo: true,
                estado: 'pendiente'
            }
        });

        if (!venta) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Solicitud no encontrada o ya fue procesada' 
            });
        }

        // Cambiar estado a cancelada
        venta.estado = 'cancelada';
        await venta.save();

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

// ========================================
// OBTENER VENTAS POR CLIENTE ID
// ========================================
const getVentasByClient = async (req, res) => {
    try {
        const ventas = await Venta.findAll({
            where: { 
                id_cliente: req.params.clientId,
                activo: true 
            },
            include: [
                { 
                    model: Propiedad, 
                    attributes: ['id', 'direccion', 'precio', 'estado', 'descripcion', 'tamaño'] 
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
                },
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ status: 200, data: ventas });
    } catch (error) {
        console.error('Error al obtener ventas del cliente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener ventas del cliente', 
            error: error.message 
        });
    }
};

const getVentaById = async (req, res) => {
    try {
        const venta = await Venta.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            },
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
                },
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
                }
            ]
        });
        if (!venta) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Venta no encontrada' 
            });
        }
        res.json({ status: 200, data: venta });
    } catch (error) {
        console.error('Error al obtener venta:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener venta', 
            error: error.message 
        });
    }
};

// ========================================
// CREAR VENTA (SOLICITUD)
// ========================================
const createVenta = async (req, res) => {
    const { id_propiedad, id_cliente, fecha_venta, monto_total } = req.body;
    try {
        if (!id_propiedad || !id_cliente || !fecha_venta || !monto_total) {
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
                message: 'La propiedad no está disponible para venta' 
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
        const nuevaVenta = await Venta.create({ 
            id_propiedad, 
            id_cliente, 
            fecha_venta, 
            monto_total, 
            estado: 'pendiente',
            usuarioId: req.userId,
            activo: true
        });

        // Cargar relaciones para la respuesta
        const ventaWithRelations = await Venta.findOne({
            where: { id: nuevaVenta.id },
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
                },
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
                }
            ]
        });

        res.status(201).json({ 
            status: 201, 
            data: ventaWithRelations, 
            message: 'Solicitud de venta creada exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear venta:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al crear venta', 
            error: error.message 
        });
    }
};

const updateVenta = async (req, res) => {
    try {
        const venta = await Venta.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!venta) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Venta no encontrada' 
            });
        }

        const { id_propiedad, id_cliente, fecha_venta, monto_total, estado } = req.body;
        
        if (id_propiedad) venta.id_propiedad = id_propiedad;
        if (id_cliente) venta.id_cliente = id_cliente;
        if (fecha_venta) venta.fecha_venta = fecha_venta;
        if (monto_total) venta.monto_total = monto_total;
        if (estado) {
            const estadoAnterior = venta.estado;
            venta.estado = estado;

            // Si se cancela la venta, restaurar estado de la propiedad
            if (estado === 'cancelada' && estadoAnterior === 'finalizada') {
                const propiedad = await Propiedad.findByPk(venta.id_propiedad);
                if (propiedad && propiedad.estado === 'vendida') {
                    propiedad.estado = 'disponible';
                    await propiedad.save();
                }
            }
        }

        await venta.save();

        // Cargar relaciones para la respuesta
        const ventaWithRelations = await Venta.findOne({
            where: { id: venta.id },
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
                },
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
                }
            ]
        });

        res.status(200).json({ 
            status: 200, 
            message: 'Venta editada exitosamente', 
            data: ventaWithRelations 
        });
    } catch (error) {
        console.error('Error al editar venta:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al editar venta', 
            error: error.message 
        });
    }
};

// ELIMINACIÓN LÓGICA
const deleteVenta = async (req, res) => {
    try {
        const venta = await Venta.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!venta) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Venta no encontrada' 
            });
        }

        // Si es cliente, verificar que sea su venta
        if (req.user.rol === 'cliente') {
            const cliente = await Cliente.findOne({
                where: {
                    id_usuario: req.user.id,
                    activo: true
                }
            });
            if (!cliente || venta.id_cliente !== cliente.id) {
                return res.status(403).json({
                    status: 403,
                    message: 'No tienes permiso para cancelar esta venta'
                });
            }
        }

        // Restaurar estado de la propiedad
        const propiedad = await Propiedad.findByPk(venta.id_propiedad);
        if (propiedad && propiedad.estado === 'vendida') {
            propiedad.estado = 'disponible';
            await propiedad.save();
        }

        venta.activo = false;
        venta.estado = 'cancelada';
        await venta.save();

        res.status(200).json({ 
            status: 200, 
            message: 'Venta desactivada exitosamente (eliminación lógica)' 
        });
    } catch (error) {
        console.error('Error al desactivar venta:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al desactivar venta', 
            error: error.message 
        });
    }
};

// ELIMINACIÓN FÍSICA (SOLO ADMIN)
const deleteVentaPermanente = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id);
        if (!venta) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Venta no encontrada' 
            });
        }

        // Restaurar estado de la propiedad antes de eliminar
        const propiedad = await Propiedad.findByPk(venta.id_propiedad);
        if (propiedad && propiedad.estado === 'vendida') {
            propiedad.estado = 'disponible';
            await propiedad.save();
        }

        await venta.destroy();

        res.status(200).json({ 
            status: 200, 
            message: '⚠️ Venta eliminada permanentemente de la base de datos' 
        });
    } catch (error) {
        console.error('Error al eliminar venta permanentemente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al eliminar venta permanentemente', 
            error: error.message 
        });
    }
};

module.exports = {
    getVentas,
    getSolicitudesPendientes,
    aprobarSolicitud,
    rechazarSolicitud,
    getVentasByClient, 
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta,
    deleteVentaPermanente
};