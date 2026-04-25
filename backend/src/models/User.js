const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * User model factory.
 * Passwords are hashed automatically via Sequelize hooks before
 * persisting to the database — plain-text passwords are never stored.
 */
module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name cannot be empty' },
          len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters' },
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: 'Must be a valid email address' },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: 'users',
      timestamps: true,
      hooks: {
        beforeCreate: async (user) => {
          user.password = await bcrypt.hash(user.password, 12);
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 12);
          }
        },
      },
    }
  );

  /** Instance method to verify a candidate password against the stored hash. */
  User.prototype.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  User.associate = (models) => {
    if (models.Project) {
      User.hasMany(models.Project, {
        foreignKey: 'userId',
        as: 'projects',
        onDelete: 'CASCADE',
      });
    }
  };

  return User;
};
