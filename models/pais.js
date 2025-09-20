'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pais extends Model {
    static associate(models) {
      Pais.hasMany(models.Provincia, { foreignKey: 'pais_id' });
    }
  }
  Pais.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Pais',
    tableName: 'paises',
    timestamps: false,
  });
  return Pais;
};
