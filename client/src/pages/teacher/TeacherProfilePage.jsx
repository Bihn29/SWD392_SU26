import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/statusLabels';
import { getRoleCode } from '../../utils/roleRedirect';

const TeacherProfilePage = () => {
  const { user } = useAuth();
  const roleCode = getRoleCode(user) || 'Teacher';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Hồ sơ cá nhân</h1>
          <p className="page-subtitle">Thông tin chi tiết về tài khoản của bạn</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <h2 className="card-title">Thông tin chung</h2>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="detail-field">
            <span className="detail-label">Họ và tên</span>
            <span className="detail-value">{user?.name || user?.fullName || '—'}</span>
          </div>

          <div className="detail-field">
            <span className="detail-label">Email</span>
            <span className="detail-value">{user?.email || '—'}</span>
          </div>

          <div className="detail-field">
            <span className="detail-label">Vai trò</span>
            <span className="detail-value">
              <span className="badge badge-info">{ROLE_LABELS[roleCode] || roleCode}</span>
            </span>
          </div>

          <div className="detail-field">
            <span className="detail-label">Trạng thái</span>
            <span className="detail-value">
              {user?.isActive !== false ? (
                <span className="badge badge-success">Hoạt động</span>
              ) : (
                <span className="badge badge-danger">Đã khóa</span>
              )}
            </span>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0, fontSize: '13px' }}>
              💡 Để thay đổi thông tin cá nhân, vui lòng liên hệ với Quản trị viên (Admin) của hệ thống.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfilePage;
