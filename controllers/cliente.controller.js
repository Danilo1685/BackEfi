const { Cliente, Usuario } = require('../models');

const getClients = async (req, res) => {
    try {
        const clients = await Cliente.findAll({
            where: { activo: true },
            include: [
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'],
                    where: { activo: true }
                }
            ]
        });
        res.json({ status: 200, data: clients });
    } catch (error) {
        console.error('Error al obtener clientes:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener clientes', 
            error: error.message 
        });
    }
};

const getClientById = async (req, res) => {
    try {
        const client = await Cliente.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            },
            include: [
                { 
                    model: Usuario, 
                    attributes: ['id', 'nombre', 'email', 'rol'] 
                }
            ]
        });
        if (!client) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Cliente no encontrado' 
            });
        }
        res.json({ status: 200, data: client });
    } catch (error) {
        console.error('Error al obtener cliente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al obtener cliente', 
            error: error.message 
        });
    }
};

const createClient = async (req, res) => {
    try {
        const { documento_identidad, telefono, id_usuario } = req.body;
        
        if (!documento_identidad || !id_usuario) {
            return res.status(400).json({ 
                status: 400, 
                message: 'Faltan campos obligatorios (documento_identidad, id_usuario)' 
            });
        }

        const usuario = await Usuario.findOne({
            where: { 
                id: id_usuario,
                activo: true 
            }
        });
        if (!usuario) {
            return res.status(404).json({
                status: 404,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        const existingClient = await Cliente.findOne({ 
            where: { documento_identidad } 
        });
        if (existingClient) {
            return res.status(400).json({
                status: 400,
                message: 'El documento de identidad ya está registrado'
            });
        }

        const newClient = await Cliente.create({ 
            documento_identidad, 
            telefono,
            id_usuario,
            activo: true
        });

        res.status(201).json({ 
            status: 201, 
            data: newClient, 
            message: 'Cliente creado exitosamente' 
        });
    } catch (error) {
        console.error('Error al crear cliente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al crear cliente', 
            error: error.message 
        });
    }
};

const updateClient = async (req, res) => {
    try {
        const client = await Cliente.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!client) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Cliente no encontrado' 
            });
        }

        const { documento_identidad, telefono } = req.body;
        
        if (documento_identidad) {
            // Verificar que el documento no esté en uso por otro cliente
            const existingClient = await Cliente.findOne({
                where: { documento_identidad }
            });
            if (existingClient && existingClient.id !== client.id) {
                return res.status(400).json({
                    status: 400,
                    message: 'El documento de identidad ya está en uso'
                });
            }
            client.documento_identidad = documento_identidad;
        }
        if (telefono !== undefined) client.telefono = telefono;

        await client.save();

        res.json({ 
            status: 200, 
            data: client, 
            message: 'Cliente actualizado exitosamente' 
        });
    } catch (error) {
        console.error('Error al actualizar cliente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al actualizar cliente', 
            error: error.message 
        });
    }
};

// ⭐ ELIMINACIÓN LÓGICA
const deleteClient = async (req, res) => {
    try {
        const client = await Cliente.findOne({
            where: { 
                id: req.params.id,
                activo: true 
            }
        });
        if (!client) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Cliente no encontrado' 
            });
        }

        client.activo = false;
        await client.save();

        res.json({ 
            status: 200, 
            message: 'Cliente desactivado exitosamente (eliminación lógica)' 
        });
    } catch (error) {
        console.error('Error al desactivar cliente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al desactivar cliente', 
            error: error.message 
        });
    }
};

// ⚠️ ELIMINACIÓN FÍSICA (SOLO ADMIN)
const deleteClientPermanente = async (req, res) => {
    try {
        const client = await Cliente.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ 
                status: 404, 
                message: 'Cliente no encontrado' 
            });
        }

        // Verificar que no tenga alquileres o ventas activas
        const { Alquiler, Venta } = require('../models');
        
        const alquileresActivos = await Alquiler.count({
            where: { 
                id_cliente: client.id,
                activo: true 
            }
        });

        const ventasActivas = await Venta.count({
            where: { 
                id_cliente: client.id,
                activo: true 
            }
        });

        if (alquileresActivos > 0 || ventasActivas > 0) {
            return res.status(400).json({
                status: 400,
                message: 'No se puede eliminar permanentemente. El cliente tiene alquileres o ventas activas.'
            });
        }

        await client.destroy();

        res.json({ 
            status: 200, 
            message: '⚠️ Cliente eliminado permanentemente de la base de datos' 
        });
    } catch (error) {
        console.error('Error al eliminar cliente permanentemente:', error);
        res.status(500).json({ 
            status: 500, 
            message: 'Error al eliminar cliente permanentemente', 
            error: error.message 
        });
    }
};

module.exports = {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    deleteClientPermanente
};