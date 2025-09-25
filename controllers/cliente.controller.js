const { Client } = require('../models');

// Obtener todos los clientes (admin o agente)
const getClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.json({ status: 200, data: clients });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener clientes', error: error.message });
    }
};

// Obtener cliente por ID
const getClientById = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ status: 404, message: 'Cliente no encontrado' });
        res.json({ status: 200, data: client });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener cliente', error: error.message });
    }
};

// Crear cliente (admin o agente)
const createClient = async (req, res) => {
    try {
        const { nombre, email, telefono } = req.body;
        const newClient = await Client.create({ nombre, email, telefono });
        res.status(201).json({ status: 201, data: newClient, message: 'Cliente creado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al crear cliente', error: error.message });
    }
};

// Actualizar cliente (admin o agente)
const updateClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ status: 404, message: 'Cliente no encontrado' });

        const { nombre, email, telefono } = req.body;
        client.nombre = nombre || client.nombre;
        client.email = email || client.email;
        client.telefono = telefono || client.telefono;

        await client.save();
        res.json({ status: 200, data: client, message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al actualizar cliente', error: error.message });
    }
};

// Eliminar cliente (solo admin)
const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByPk(req.params.id);
        if (!client) return res.status(404).json({ status: 404, message: 'Cliente no encontrado' });

        await client.destroy();
        res.json({ status: 200, message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al eliminar cliente', error: error.message });
    }
};

module.exports = {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient
};
