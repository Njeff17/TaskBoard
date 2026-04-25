require('dotenv').config();

const app = require('./app');
const seedAdmin = require('./src/config/seed');
const { sequelize } = require('./src/models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized with database.');

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 TaskBoard server running at http://localhost:${PORT}`);
      console.log(`   API available at http://localhost:${PORT}/api/v1`);
      console.log(`   Frontend available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
