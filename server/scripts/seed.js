const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Subject = require('../src/models/Subject');
const Lesson = require('../src/models/Lesson');
const Registration = require('../src/models/Registration');

const seedDataPath = path.join(__dirname, '../data/seed.vi.json');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/onlinelearn';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    console.log(`Reading seed data from ${seedDataPath}...`);
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
    const { users, subjects, lessons, registrations } = seedData;

    console.log('Clearing existing Collections...');
    await User.deleteMany({});
    await User.updateMany({}, { $unset: { password: "" } });
    await Subject.deleteMany({});
    await Lesson.deleteMany({});
    await Registration.deleteMany({});

    console.log('Hashing passwords for users...');
    const usersWithHashes = await Promise.all(users.map(async (u) => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(u.password || '123456', salt);
      const newUser = { ...u, passwordHash };
      delete newUser.password;
      return newUser;
    }));

    console.log('Inserting Users...');
    const createdUsers = await User.create(usersWithHashes);
    
    const userMap = {};
    let adminId = null;
    createdUsers.forEach((u) => {
      userMap[u.email] = u._id;
      if (u.role === 'Admin') adminId = u._id;
    });

    console.log('Inserting Subjects...');
    const mappedSubjects = subjects.map((subj) => ({
      ...subj,
      owner: userMap[subj.expertEmail],
      createdBy: adminId,
      updatedBy: adminId
    }));

    const createdSubjects = await Subject.create(mappedSubjects);
    const subjectMap = {};
    createdSubjects.forEach(s => {
      subjectMap[s.name] = s._id;
    });

    console.log('Inserting Lessons...');
    const mappedLessons = lessons.map(les => ({
      subject: subjectMap[les.subjectName],
      title: les.title,
      type: les.type,
      order: les.order,
      videoUrl: les.videoUrl,
      htmlContent: les.htmlContent,
      status: les.status,
      createdBy: adminId,
      updatedBy: adminId
    }));
    await Lesson.create(mappedLessons);

    console.log('Inserting Registrations...');
    const mappedRegs = registrations.map(reg => ({
      student: userMap[reg.studentEmail],
      subject: subjectMap[reg.subjectName],
      status: reg.status,
      registeredAt: new Date(),
      approvedBy: reg.status === 'Approved' ? adminId : undefined,
      approvedAt: reg.status === 'Approved' ? new Date() : undefined,
    }));
    // Remove duplicates or missing refs
    const validRegs = mappedRegs.filter(r => r.student && r.subject);
    const uniqueRegs = [];
    const seen = new Set();
    validRegs.forEach(r => {
      const key = `${r.student}_${r.subject}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueRegs.push(r);
      }
    });
    await Registration.create(uniqueRegs);

    console.log('Database seeded completely!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
