const { User } = require('../models');

/**
 * Seeds a super-admin user on first startup.
 * Uses credentials from environment variables so they are configurable
 * without touching code. Does nothing if the admin already exists.
 */
const seedAdmin = async () => {
  const email    = process.env.ADMIN_EMAIL    || 'admin@taskboard.local';
  const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
  const name     = process.env.ADMIN_NAME     || 'Super Admin';

  const exists = await User.findOne({ where: { email } });

  if (exists) {
    console.log(`ℹ️  Super-admin already exists (${email}) — skipping seed.`);
    return;
  }

  await User.create({ name, email, password });

  console.log('');
  console.log('┌──────────────────────────────────────────┐');
  console.log('│         🛡️  Super-Admin Created           │');
  console.log('├──────────────────────────────────────────┤');
  console.log(`│  Email   : ${email.padEnd(30)}│`);
  console.log(`│  Password: ${password.padEnd(30)}│`);
  console.log('│                                          │');
  console.log('│  ⚠️  Change this password after login!   │');
  console.log('└──────────────────────────────────────────┘');
  console.log('');
};

module.exports = seedAdmin;
