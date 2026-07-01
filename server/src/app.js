const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const roleRoutes = require('./routes/roleRoutes');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Online Learning System API is running',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/admin/roles', roleRoutes);
app.use('/api/admin/users', require('./routes/userRoutes'));
app.use('/api/admin/subjects/:subjectId/lessons', require('./routes/lessonRoutes'));
app.use('/api/admin/lessons', require('./routes/lessonRoutes'));
app.use('/api/admin/subjects/:subjectId/students', require('./routes/registrationRoutes'));
app.use('/api/admin/dashboard', require('./routes/dashboardRoutes'));

// ─── Teacher Routes ──────────────────────────────────────────────────────────
const { checkCourseOwner } = require('./middlewares/ownerMiddleware');
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/teacher/courses/:subjectId/lessons', checkCourseOwner, require('./routes/lessonRoutes'));
app.use('/api/teacher/courses/:subjectId/students', checkCourseOwner, require('./routes/registrationRoutes'));
// ─── Error Handlers ──────────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
