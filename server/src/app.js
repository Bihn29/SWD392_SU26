const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const roleRoutes = require('./routes/roleRoutes');
const { errorMiddleware, notFoundMiddleware } = require('./middlewares/errorMiddleware');
const { protect } = require('./middlewares/authMiddleware');
const { requireRole } = require('./middlewares/roleMiddleware');

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

// ─── Static Files (Uploads) ───────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

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
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/subjects', subjectRoutes);
app.use('/api/student', require('./routes/studentRoutes'));
app.use('/api/admin/roles', protect, requireRole('Admin'), roleRoutes);
app.use('/api/admin/users', protect, requireRole('Admin', 'Manager'), require('./routes/userRoutes'));
app.use('/api/admin/subjects/:subjectId/lessons', protect, requireRole('Admin', 'Manager'), require('./routes/lessonRoutes'));
app.use('/api/admin/lessons', protect, requireRole('Admin', 'Manager'), require('./routes/lessonRoutes'));
app.use('/api/admin/subjects/:subjectId/students', protect, requireRole('Admin', 'Manager'), require('./routes/registrationRoutes'));
app.use('/api/admin/dashboard', require('./routes/dashboardRoutes'));

// ─── Teacher Routes ──────────────────────────────────────────────────────────
const { checkCourseOwner } = require('./middlewares/ownerMiddleware');
app.use('/api/teacher', require('./routes/teacherRoutes'));
app.use('/api/teacher/courses/:subjectId/lessons', checkCourseOwner, require('./routes/lessonRoutes'));
app.use('/api/teacher/courses/:subjectId/students', checkCourseOwner, require('./routes/registrationRoutes'));

// ─── QA Routes ───────────────────────────────────────────────────────────────
app.use('/api/qa', require('./routes/qaRoutes'));

// ─── Progress Routes ─────────────────────────────────────────────────────────
app.use('/api/progress', require('./routes/progressRoutes'));

// ─── Error Handlers ──────────────────────────────────────────────────────────
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
