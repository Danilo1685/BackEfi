const { Model, DataTypes } = require('sequelize');
const bcrypt = require("bcryptjs");

class Usuario extends Model {
  static associate(models) {
    // aquí puedes poner tus relaciones, ej:
    // this.hasMany(models.Producto);
  }
}

module.exports = (sequelize) => {
  Usuario.init({
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    edad: DataTypes.INTEGER,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rol: {
      type: DataTypes.ENUM('admin', 'moderador', 'cliente'),
      allowNull: false,
      defaultValue: 'cliente'
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
        if (usuario.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          usuario.password = await bcrypt.hash(usuario.password, salt);
        }
      }
    }
  });

  return Usuario;
};
    