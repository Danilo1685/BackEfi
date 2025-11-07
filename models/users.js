'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  class Usuario extends Model {
    static associate(models) {
      // Relaciones con otras tablas
      Usuario.hasMany(models.Propiedad, { foreignKey: 'id_agente' });
      Usuario.hasMany(models.Venta, { foreignKey: 'usuarioId' });
      Usuario.hasOne(models.Cliente, { foreignKey: 'id_usuario' });
    }
  }

  Usuario.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'El nombre es obligatorio'
        },
        notEmpty: {
          msg: 'El nombre no puede estar vacío'
        },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'Este email ya está registrado'
      },
      validate: {
        notNull: {
          msg: 'El email es obligatorio'
        },
        notEmpty: {
          msg: 'El email no puede estar vacío'
        },
        isEmail: {
          msg: 'Debe proporcionar un email válido (ejemplo: usuario@dominio.com)'
        }
      }
    },
    edad: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        isInt: {
          msg: 'La edad debe ser un número entero'
        },
        min: {
          args: [18],
          msg: 'Debes ser mayor de 18 años'
        },
        max: {
          args: [120],
          msg: 'La edad no puede ser mayor a 120 años'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'La contraseña es obligatoria'
        },
        notEmpty: {
          msg: 'La contraseña no puede estar vacía'
        },
        len: {
          args: [6, 100],
          msg: 'La contraseña debe tener al menos 6 caracteres'
        }
      }
    },
    rol: {
      type: DataTypes.ENUM('admin', 'agente', 'cliente'),
      allowNull: false,
      defaultValue: 'cliente',
      validate: {
        isIn: {
          args: [['admin', 'agente', 'cliente']],
          msg: 'El rol debe ser: admin, agente o cliente'
        }
      }
    },
    activo: { 
      type: DataTypes.BOOLEAN, 
      allowNull: false,
      defaultValue: true 
    }
  }, {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true,
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.password) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      }
    }
  });

  return Usuario;
};