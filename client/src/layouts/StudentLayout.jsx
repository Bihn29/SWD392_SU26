import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../utils/statusLabels';
import { getRoleCode } from '../utils/roleRedirect';

const NAV_ITEMS = [
  { to: '/student/home', icon: '🏠', label: 'Trang chủ' },
  { to: '/student/quiz', icon: '✍️', label: 'Quiz' },
  { to: '/student/my-courses', icon: '🎓', label: 'Khóa học của tôi' },
  { to: '/student/profile', icon: '👤', label: 'Hồ sơ' },
];

const StudentLayout = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.fullName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  const roleCode = getRoleCode(user) || 'Student';

  return (
    <div className="admin-layout student-layout">
      {/* ── Sidebar ───────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">OnlineLearn</span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Học viên</div>
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              id={`nav-student-${label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <span className="sidebar-nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || user?.fullName || 'Học viên'}</div>
              <div className="sidebar-user-role">{ROLE_LABELS[roleCode] || roleCode || '—'}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-full"
            style={{ marginTop: '12px' }}
            onClick={handleLogout}
            id="sidebar-student-logout-btn"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="header-title">Học tập</div>
          <div className="header-actions">
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Học viên, <strong style={{ color: 'var(--text-primary)' }}>{user?.name || user?.fullName}</strong>
            </span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
