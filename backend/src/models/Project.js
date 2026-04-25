const { DataTypes } = require('sequelize');

/**
 * Project model factory.
 * A project is always owned by a single User (userId foreign key).
 * Deleting a project cascades to delete all of its Tasks.
 */
module.exports = (sequelize) => {
  const Project = sequelize.define(
    'Project',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Project name cannot be empty' },
          len: { args: [1, 150], msg: 'Project name cannot exceed 150 characters' },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'projects',
      timestamps: true,
    }
  );

  Project.associate = (models) => {
    Project.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'owner',
    });
    Project.hasMany(models.Task, {
      foreignKey: 'projectId',
      as: 'tasks',
      onDelete: 'CASCADE',
      hooks: true,
    });
  };

  return Project;
};
