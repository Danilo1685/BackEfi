'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TipoPropiedad extends Model {
    static associate(models) {
      TipoPropiedad.hasMany(models.Propiedad, { foreignKey: 'tipo_id' });
    }
  }
  TipoPropiedad.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      activo: { type: DataTypes.BOOLEAN, allowNull:false ,  defaultValue: true }
    }
  }, {
    sequelize,
    modelName: 'TipoPropiedad',
    tableName: 'tipo_propiedad',
    timestamps: false,
  });
  return TipoPropiedad;
};
