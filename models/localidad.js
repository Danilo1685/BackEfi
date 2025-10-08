'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Localidad extends Model {
    static associate(models) {
      Localidad.belongsTo(models.Provincia, { foreignKey: 'provincia_id' });
    }
  }
  Localidad.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      activo: { type: DataTypes.BOOLEAN, allowNull:false ,  defaultValue: true }
    }
  }, {
    sequelize,
    modelName: 'Localidad',
    tableName: 'localidades',
    timestamps: false,
  });
  return Localidad;
};

