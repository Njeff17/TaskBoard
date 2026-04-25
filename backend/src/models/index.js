'use strict';

const sequelize = require('../config/database');

// ── Import model factories ─────────────────────────────────────────────────
const UserFactory = require('./User');

// ── Instantiate models ─────────────────────────────────────────────────────
const User = UserFactory(sequelize);

const models = { User };

// ── Run associations (if defined on each model) ────────────────────────────
Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = { sequelize, ...models };
