'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Provincia extends Model {
    static associate(models) {
      Provincia.belongsTo(models.Pais, { foreignKey: 'pais_id' });
      Provincia.hasMany(models.Localidad, { foreignKey: 'provincia_id' });
    }
  }
  Provincia.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      activo: { type: DataTypes.BOOLEAN, allowNull:false ,  defaultValue: true }
    }
  }, {
    sequelize,
    modelName: 'Provincia',
    tableName: 'provincias',
    timestamps: false,
  });
  return Provincia;
};
