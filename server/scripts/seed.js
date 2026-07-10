const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Subject = require('../src/models/Subject');
const Lesson = require('../src/models/Lesson');
const Registration = require('../src/models/Registration');
const Question = require('../src/models/Question');

const seedDataPath = path.join(__dirname, '../data/seed.vi.json');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/online_learn';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected successfully!');

    console.log(`Reading seed data from ${seedDataPath}...`);
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
    const { users, subjects, lessons, registrations, questions } = seedData;

    console.log('Clearing existing Collections...');
    await User.deleteMany({});
    await User.updateMany({}, { $unset: { password: "" } });
    await Subject.deleteMany({});
    await Lesson.deleteMany({});
    await Registration.deleteMany({});
    await Question.deleteMany({});

    console.log('Preparing users...');
    const usersWithPasswords = users.map((u) => {
      const newUser = { ...u, password: u.password || '123456' };
      return newUser;
    });

    console.log('Inserting Users...');
    const createdUsers = await User.create(usersWithPasswords);
    
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

    console.log('Inserting Questions...');
    // We need to map lesson titles to lesson IDs
    const allLessons = await Lesson.find({});
    const lessonMap = {};
    allLessons.forEach(l => {
      // Key format: subjectId_title
      lessonMap[`${l.subject}_${l.title}`] = l._id;
    });

    if (questions && questions.length > 0) {
      const mappedQuestions = questions.map(q => {
        const subjectId = subjectMap[q.subjectName];
        const lessonId = lessonMap[`${subjectId}_${q.lessonTitle}`];
        return {
          ...q,
          lesson: lessonId,
          createdBy: adminId,
          updatedBy: adminId
        };
      });
      // Filter out invalid ones
      const validQuestions = mappedQuestions.filter(q => q.lesson);
      await Question.create(validQuestions);
    }

    console.log('Database seeded completely!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
