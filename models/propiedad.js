'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
class Propiedad extends Model {
    static associate(models) {
      Propiedad.belongsTo(models.TipoPropiedad, { foreignKey: 'tipo_id' });
      Propiedad.belongsTo(models.Usuario, { foreignKey: 'id_agente' });
      Propiedad.hasMany(models.Alquiler, { foreignKey: 'id_propiedad' });
      Propiedad.hasMany(models.Venta, { foreignKey: 'id_propiedad' });
    }
  }
  Propiedad.init({
    direccion: { type: DataTypes.STRING, allowNull: false },
    precio: { type: DataTypes.DECIMAL, allowNull: false },
    estado: { type: DataTypes.ENUM('disponible', 'alquilada', 'vendida'), allowNull: false },
    descripcion: DataTypes.TEXT,
    tamaño: DataTypes.DECIMAL,
  }, {
    sequelize,
    modelName: 'Propiedad',
    tableName: 'propiedades',
    timestamps: true,
  });
  return Propiedad;
};
