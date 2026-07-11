const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Role = require('../src/models/Role');
const seedDataPath = path.join(__dirname, '../data/roleSeed.vi.json');

const seedRoles = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/onlinelearn';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    // Read seed data
    console.log(`Reading role seed data from ${seedDataPath}...`);
    const roles = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    // We can wipe the roles collection first, or insert new ones if they don't exist.
    // For simplicity, we wipe all roles and insert the predefined ones.
    console.log('Synchronizing system Roles...');
    await Role.bulkWrite(roles.map((role) => ({
      updateOne: {
        filter: { code: role.code },
        update: { $set: role },
        upsert: true,
      },
    })));
    console.log('Roles synchronized successfully.');

    console.log('Roles seeded completely!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

seedRoles();
