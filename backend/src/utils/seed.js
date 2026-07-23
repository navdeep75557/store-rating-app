// One-off script: creates the very first System Administrator account
// so there's a way to log in and start adding stores/users/admins.
// Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('../models');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  const email = process.env.ADMIN_EMAIL || 'admin@storerating.com';
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin account already exists: ${email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@1234', 10);
  await User.create({
    name: process.env.ADMIN_NAME || 'System Administrator Account',
    email,
    address: process.env.ADMIN_ADDRESS || 'Head Office',
    password: hashed,
    role: 'SYSTEM_ADMIN',
  });

  console.log(`Created System Administrator: ${email} / (password from .env)`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
