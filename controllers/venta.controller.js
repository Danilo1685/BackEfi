const { Venta } = require('../models');

// Obtener todas las ventas
const getVentas = async (req, res) => {
    try {
        const ventas = await Venta.findAll();
        res.json({ status: 200, data: ventas });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener ventas', error: error.message });
    }
};

// Obtener venta por ID
const getVentaById = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id);
        if (!venta) {
            return res.status(404).json({ status: 404, message: 'Venta no encontrada' });
        }
        res.json({ status: 200, data: venta });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al obtener venta', error: error.message });
    }
};

// Crear venta
const createVenta = async (req, res) => {
    const { id_propiedad, id_cliente, fecha_venta, monto_total, estado } = req.body;
    try {
        if (!id_propiedad || !id_cliente || !fecha_venta || !monto_total || !estado) {
            return res.status(400).json({ status: 400, message: 'Faltan campos obligatorios' });
        }

        const nuevaVenta = await Venta.create({ id_propiedad, id_cliente, fecha_venta, monto_total, estado });
        res.status(201).json({ status: 201, data: nuevaVenta, message: 'Venta creada exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al crear venta', error: error.message });
    }
};

// Editar venta
const updateVenta = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id);
        if (!venta) {
            return res.status(404).json({ status: 404, message: 'Venta no encontrada' });
        }

        const { id_propiedad, id_cliente, fecha_venta, monto_total, estado } = req.body;
        venta.id_propiedad = id_propiedad || venta.id_propiedad;
        venta.id_cliente = id_cliente || venta.id_cliente;
        venta.fecha_venta = fecha_venta || venta.fecha_venta;
        venta.monto_total = monto_total || venta.monto_total;
        venta.estado = estado || venta.estado;

        await venta.save();
        res.status(200).json({ status: 200, message: 'Venta editada exitosamente', data: venta });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al editar venta', error: error.message });
    }
};

// Eliminar venta
const deleteVenta = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id);
        if (!venta) {
            return res.status(404).json({ status: 404, message: 'Venta no encontrada' });
        }

        await venta.destroy();
        res.status(200).json({ status: 200, message: 'Venta eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error al eliminar venta', error: error.message });
    }
};

module.exports = {
    getVentas,
    getVentaById,
    createVenta,
    updateVenta,
    deleteVenta
};
