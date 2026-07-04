import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_LABELS } from '../utils/statusLabels';
import { getRoleCode } from '../utils/roleRedirect';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: '📊', label: 'Tổng quan', roles: ['Admin', 'Expert', 'Manager', 'Teacher'] },
  { to: '/admin/users', icon: '👥', label: 'Người dùng & Vai trò', roles: ['Admin', 'Manager'] },
  { to: '/admin/subjects', icon: '📚', label: 'Quản lý khóa học', roles: ['Admin', 'Expert', 'Manager', 'Teacher'] },
  { to: '/admin/settings', icon: '⚙️', label: 'Cài đặt', roles: ['Admin'] },
];

const AdminLayout = () => {
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

  const roleCode = getRoleCode(user) || 'Admin';

  return (
    <div className="admin-layout">
      {/* ── Sidebar ───────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">
            {roleCode === 'Manager' ? 'OnlineLearn Manager' : 'OnlineLearn Admin'}
          </span>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Quản lý</div>
          {NAV_ITEMS.filter(item => item.roles.includes(roleCode)).map(({ to, icon, label }) => {
            const displayLabel = (roleCode === 'Manager' && label === 'Người dùng & Vai trò') ? 'Người dùng' : label;
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidebar-nav-item ${isActive ? 'active' : ''}`
                }
                id={`nav-${displayLabel.toLowerCase().replace(/\s/g, '-')}`}
              >
                <span className="sidebar-nav-icon">{icon}</span>
                <span>{displayLabel}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || user?.fullName || 'Người dùng'}</div>
              <div className="sidebar-user-role">{ROLE_LABELS[roleCode] || roleCode || '—'}</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm btn-full"
            style={{ marginTop: '12px' }}
            onClick={handleLogout}
            id="sidebar-logout-btn"
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="top-header">
          <div className="header-title">
            {roleCode === 'Manager' ? 'Bảng điều khiển Quản lý' : 'Bảng điều khiển Admin'}
          </div>
          <div className="header-actions">
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Xin chào, <strong style={{ color: 'var(--text-primary)' }}>{user?.name || user?.fullName}</strong>
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

export default AdminLayout;
