import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './components/common/Toast';

// Layouts
import AdminLayout from './layouts/AdminLayout';

// Pages - Public & Auth
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Pages - Roles
import TeacherDashboardPage from './pages/teacher/TeacherDashboardPage';
import MyCoursesPage from './pages/student/MyCoursesPage';

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
    if (roleCode === 'Student') return <Navigate to="/my-courses" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
};

// ─── App ──────────────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<HomePage />} />

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
          <RoleRoute roles={['Admin']}>
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
    </Route>

    {/* Teacher Area */}
    <Route
      path="/teacher"
      element={
        <ProtectedRoute>
          <RoleRoute roles={['Teacher']}>
            <TeacherDashboardPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />

    {/* Student Area */}
    <Route
      path="/my-courses"
      element={
        <ProtectedRoute>
          <RoleRoute roles={['Student']}>
            <MyCoursesPage />
          </RoleRoute>
        </ProtectedRoute>
      }
    />

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
