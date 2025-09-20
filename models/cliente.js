'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Cliente extends Model {
    static associate(models) {
      Cliente.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
      Cliente.hasMany(models.Alquiler, { foreignKey: 'id_cliente' });
      Cliente.hasMany(models.Venta, { foreignKey: 'id_cliente' });
    }
  }
  Cliente.init({
    documento_identidad: { type: DataTypes.STRING, unique: true, allowNull: false },
    telefono: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Cliente',
    tableName: 'clientes',
    timestamps: true,
  });
  return Cliente;
};
