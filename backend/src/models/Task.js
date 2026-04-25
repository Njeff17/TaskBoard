const { DataTypes } = require('sequelize');

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];

// Task model
module.exports = (sequelize) => {
  const Task = sequelize.define(
    'Task',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Task title cannot be empty' },
          len: { args: [1, 200], msg: 'Task title cannot exceed 200 characters' },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(...TASK_STATUSES),
        allowNull: false,
        defaultValue: 'TODO',
        validate: {
          isIn: { args: [TASK_STATUSES], msg: 'Status must be TODO, IN_PROGRESS, or DONE' },
        },
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      projectId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: 'tasks',
      timestamps: true,
    }
  );

  Task.associate = (models) => {
    Task.belongsTo(models.Project, {
      foreignKey: 'projectId',
      as: 'project',
    });
  };

  return Task;
};

module.exports.TASK_STATUSES = TASK_STATUSES;
