'use strict';

const sequelize = require('../config/database');

const UserFactory    = require('./User');
const ProjectFactory = require('./Project');
const TaskFactory    = require('./Task');

const User    = UserFactory(sequelize);
const Project = ProjectFactory(sequelize);
const Task    = TaskFactory(sequelize);

const models = { User, Project, Task };

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
