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
    direccion: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    precio: { 
      type: DataTypes.DECIMAL(15, 2), // ✅ CORREGIDO: 15 dígitos totales, 2 decimales
      allowNull: false 
    },
    estado: { 
      type: DataTypes.ENUM('disponible', 'alquilada', 'vendida'), 
      allowNull: false,
      defaultValue: 'disponible' 
    },
    descripcion: DataTypes.TEXT,
    tamaño: DataTypes.DECIMAL(65, 2),
    activo: { 
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: true 
    }
  }, {
    sequelize,
    modelName: 'Propiedad',
    tableName: 'propiedades',
    timestamps: true,
  });
  return Propiedad;
};