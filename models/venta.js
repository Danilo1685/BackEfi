'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Venta extends Model {
    static associate(models) {
      Venta.belongsTo(models.Propiedad, { foreignKey: 'id_propiedad' });
      Venta.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
      Venta.belongsTo(models.Usuario, { foreignKey: 'usuarioId' });
    }
  }
  Venta.init({
    fecha_venta: { type: DataTypes.DATE, allowNull: false },
    monto_total: { type: DataTypes.DECIMAL, allowNull: false },
    estado: { 
      type: DataTypes.ENUM('pendiente', 'aprobado', 'finalizada', 'cancelada'), 
      defaultValue: 'pendiente',
      allowNull: false 
    },
    activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
  }, {
    sequelize,
    modelName: 'Venta',
    tableName: 'ventas',
    timestamps: true,
  });
  return Venta;
};