'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alquiler extends Model {
    static associate(models) {
      Alquiler.belongsTo(models.Propiedad, { foreignKey: 'id_propiedad' });
      Alquiler.belongsTo(models.Cliente, { foreignKey: 'id_cliente' });
    }
  }
  Alquiler.init({
    fecha_inicio: { type: DataTypes.DATE, allowNull: false },
    fecha_fin: { type: DataTypes.DATE, allowNull: false },
    monto_mensual: { type: DataTypes.DECIMAL, allowNull: false },
    estado: { type: DataTypes.ENUM('activo', 'finalizado', 'cancelado'), defaultValue: 'activo' },
    activo: { type: DataTypes.BOOLEAN, allowNull:false ,  defaultValue: true }
  }, {
    sequelize,
    modelName: 'Alquiler',
    tableName: 'alquileres',
    timestamps: true,
  });
  return Alquiler;
};
