import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages - Public & Auth
import HomePage from './pages/public/HomePage';
import CoursesPage from './pages/public/CoursesPage';
import CourseDetailPage from './pages/public/CourseDetailPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages - Roles
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import TeacherProfilePage from './pages/teacher/TeacherProfilePage';
import StudentHomePage from './pages/student/StudentHomePage';
import MyCoursesPage from './pages/student/MyCoursesPage';
import StudentQuizPage from './pages/student/StudentQuizPage';

import LearningWorkspacePage from './pages/student/LearningWorkspacePage';

// Pages - Dashboard
import DashboardPage from './pages/admin/DashboardPage';

// Pages - Subjects
import SubjectListPage from './pages/admin/subjects/SubjectListPage';
import SubjectCreatePage from './pages/admin/subjects/SubjectCreatePage';
import SubjectEditPage from './pages/admin/subjects/SubjectEditPage';
import SubjectDetailPage from './pages/admin/subjects/SubjectDetailPage';

// Pages - Users & Roles
import UserListPage from './pages/admin/users/UserListPage';
import UserFormPage from './pages/admin/users/UserFormPage';
import RoleListPage from './pages/admin/roles/RoleListPage';
import RoleCreatePage from './pages/admin/roles/RoleCreatePage';
import RoleDetailPage from './pages/admin/roles/RoleDetailPage';
import RoleEditPage from './pages/admin/roles/RoleEditPage';

// ─── Route Guards ─────────────────────────────────────────────────────────────
import { getRoleCode } from './utils/roleRedirect';

const DEV_BYPASS = false; // set to false to re-enable auth

/**
 * Redirect to /login if not authenticated.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (DEV_BYPASS) return children; // ─ DEV: skip auth check

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0d0f17' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6c63ff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

/**
 * Require specific role(s). Redirects to / if unauthorized.
 */
const RoleRoute = ({ children, roles }) => {
  if (DEV_BYPASS) return children; // ─ DEV: skip role check
  const { user } = useAuth();
  const roleCode = getRoleCode(user);
  if (roles && !roles.includes(roleCode)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

/**
 * Redirect if already logged in based on role.
 */
const GuestRoute = ({ children }) => {
  if (DEV_BYPASS) return children; // ─ DEV: skip login
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) return null;
  if (isAuthenticated) {
    const roleCode = getRoleCode(user);
    if (roleCode === 'Admin' || roleCode === 'Manager') return <Navigate to="/admin/dashboard" replace />;
    if (roleCode === 'Teacher') return <Navigate to="/teacher" replace />;
    if (roleCode === 'Student') return <Navigate to="/student" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<HomePage />} />
    <Route path="/courses" element={<CoursesPage />} />
    <Route path="/courses/:id" element={<CourseDetailPage />} />

    {/* Auth */}
    <Route
      path="/login"
      element={
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      }
    />
    <Route
      path="/register"
      element={
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      }
    />

    {/* Admin area */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute>
          <RoleRoute roles={['Admin', 'Manager', 'Expert']}>
            <AdminLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
    >
      {/* Dashboard */}
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route
        path="dashboard"
        element={
          <RoleRoute roles={['Admin', 'Manager']}>
            <DashboardPage />
          </RoleRoute>
        }
      />

      {/* Subjects */}
      <Route path="subjects" element={<SubjectListPage />} />
      <Route
        path="subjects/create"
        element={
          <RoleRoute roles={['Admin', 'Manager']}>
            <SubjectCreatePage />
          </RoleRoute>
        }
      />
      <Route path="subjects/:id" element={<SubjectDetailPage />} />
      <Route path="subjects/:id/edit" element={<SubjectEditPage />} />

      {/* Users */}
      <Route
        path="users"
        element={
          <RoleRoute roles={['Admin', 'Manager']}>
            <UserListPage />
          </RoleRoute>
        }
      />
      <Route
        path="users/create"
        element={
          <RoleRoute roles={['Admin', 'Manager']}>
            <UserFormPage />
          </RoleRoute>
        }
      />
      <Route
        path="users/:id/edit"
        element={
          <RoleRoute roles={['Admin', 'Manager']}>
            <UserFormPage />
          </RoleRoute>
        }
      />

      {/* Roles */}
      <Route
        path="roles"
        element={
          <RoleRoute roles={['Admin']}>
            <RoleListPage />
          </RoleRoute>
        }
      />
      <Route
        path="roles/create"
        element={
          <RoleRoute roles={['Admin']}>
            <RoleCreatePage />
          </RoleRoute>
        }
      />
      <Route
        path="roles/:id"
        element={
          <RoleRoute roles={['Admin']}>
            <RoleDetailPage />
          </RoleRoute>
        }
      />
      <Route
        path="roles/:id/edit"
        element={
          <RoleRoute roles={['Admin']}>
            <RoleEditPage />
          </RoleRoute>
        }
      />
    </Route>

    {/* Teacher Area */}
    <Route
      path="/teacher"
      element={
        <ProtectedRoute>
          <RoleRoute roles={['Teacher', 'Expert']}>
            <TeacherLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<TeacherDashboardPage />} />
      <Route path="courses" element={<SubjectListPage isTeacher={true} />} />
      <Route path="courses/create" element={<SubjectCreatePage isTeacher={true} />} />
      <Route path="courses/:id" element={<SubjectDetailPage isTeacher={true} />} />
      <Route path="courses/:id/edit" element={<SubjectEditPage isTeacher={true} />} />
      <Route path="profile" element={<TeacherProfilePage />} />
    </Route>

    {/* Student Area */}
    <Route
      path="/student"
      element={
        <ProtectedRoute>
          <RoleRoute roles={['Student']}>
            <StudentLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<StudentHomePage />} />
      <Route path="quiz" element={<StudentQuizPage />} />
      <Route path="my-courses" element={<MyCoursesPage />} />
      <Route path="my-courses/:id" element={<LearningWorkspacePage />} />
      <Route path="profile" element={<TeacherProfilePage />} />
    </Route>

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
