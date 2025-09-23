// scripts/seed.js
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/leave_management';
  await connectDB(uri);
  console.log('DB connected');

  // remove existing demo users
  await User.deleteMany({ username: { $in: ['demo_employee', 'demo_manager'] } });

  const manager = await User.createWithPassword({
    username: 'demo_manager',
    password: 'demo',
    name: 'Manager Demo',
    role: 'manager'
  });

  const employee = await User.createWithPassword({
    username: 'demo_employee',
    password: 'demo',
    name: 'Employee Demo',
    role: 'employee',
    managerId: manager._id
  });

  console.log('Seed completed:');
  console.log({ manager: { username: manager.username, password: 'demo' }, employee: { username: employee.username, password: 'demo' } });
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
