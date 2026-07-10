import { useState, useEffect, useCallback } from 'react';
import { getDashboardOverview, getDashboardDetails } from '../../api/dashboardApi';
import StatusBadge from '../../components/common/StatusBadge';
import { useAuth } from '../../contexts/AuthContext';
import { getRoleCode } from '../../utils/roleRedirect';

const DashboardPage = () => {
  const { user } = useAuth();
  const roleCode = getRoleCode(user);
  const isManager = roleCode === 'Manager';
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  const [activeCard, setActiveCard] = useState('users');
  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  // 1. Load Overview
  const fetchOverview = useCallback(async () => {
    setLoadingOverview(true);
    setOverviewError('');
    try {
      const res = await getDashboardOverview();
      setOverview(res.data.data.stats);
    } catch (err) {
      setOverviewError(err.response?.data?.message || 'Không thể tải dữ liệu tổng quan');
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // 2. Load Details when activeCard changes
  const fetchDetails = useCallback(async (type) => {
    setLoadingDetails(true);
    setDetailsError('');
    try {
      const res = await getDashboardDetails(type);
      setDetails(res.data.data || []);
    } catch (err) {
      setDetailsError('Không thể tải chi tiết');
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  useEffect(() => {
    if (activeCard) {
      fetchDetails(activeCard);
    }
  }, [activeCard, fetchDetails]);

  // ─── Cards Data ─────────────────────────────────────────────────────────────
  const cards = [
    { id: 'users', title: 'Tổng số người dùng', count: overview?.totalUsers || 0, desc: 'Toàn bộ người dùng', icon: '👥' },
    { id: 'admins', title: 'Tổng số quản trị viên', count: overview?.totalAdmins || 0, desc: 'Có quyền cao nhất', icon: '👑' },
    { id: 'managers', title: 'Tổng số quản lý', count: overview?.totalManagers || 0, desc: 'Quản lý hệ thống', icon: '👔' },
    { id: 'teachers', title: 'Tổng số giảng viên', count: overview?.totalTeachers || 0, desc: 'Tạo khóa học', icon: '👨‍🏫' },
    { id: 'students', title: 'Tổng số học viên', count: overview?.totalStudents || 0, desc: 'Người học', icon: '🎓' },
    { id: 'subjects', title: 'Tổng số khóa học', count: overview?.totalSubjects || 0, desc: 'Tất cả khóa học', icon: '📚' },
    { id: 'publishedSubjects', title: 'Khóa học đã xuất bản', count: overview?.publishedSubjects || 0, desc: 'Đang hiển thị', icon: '✅' },
    { id: 'draftSubjects', title: 'Khóa học bản nháp', count: overview?.draftSubjects || 0, desc: 'Chưa công khai', icon: '📝' },
    { id: 'lessons', title: 'Tổng số bài học', count: overview?.totalLessons || 0, desc: 'Toàn bộ bài học', icon: '📖' },
    { id: 'enrolledStudents', title: 'Tổng số học viên đang học', count: overview?.totalEnrolledStudents || 0, desc: 'Đã duyệt vào lớp', icon: '🎟️' },
  ];

  const filteredCards = isManager ? cards.filter(c => c.id !== 'admins') : cards;

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-GB') : '—');

  // ─── Detail Tables Renderers ────────────────────────────────────────────────
  const renderUserTable = () => (
    <table className="table">
      <thead>
        <tr>
          <th>Họ và tên</th>
          <th>Email</th>
          <th>Vai trò</th>
          <th>Số điện thoại</th>
          <th>Trạng thái</th>
          <th>Ngày tạo</th>
        </tr>
      </thead>
      <tbody>
        {details.map((u) => (
          <tr key={u._id}>
            <td style={{ fontWeight: '500' }}>{u.name}</td>
            <td>{u.email}</td>
            <td>
              <span className="badge badge-featured">
                {u.role === 'Admin' ? 'Quản trị viên' : u.role === 'Manager' ? 'Quản lý' : u.role === 'Teacher' ? 'Giảng viên' : 'Học viên'}
              </span>
            </td>
            <td>{u.phone || '—'}</td>
            <td>
              <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                {u.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
              </span>
            </td>
            <td>{formatDate(u.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderSubjectTable = () => (
    <table className="table">
      <thead>
        <tr>
          <th>Tên khóa học</th>
          <th>Danh mục</th>
          <th>Giảng viên</th>
          <th>Trạng thái</th>
          <th>Ngày tạo</th>
        </tr>
      </thead>
      <tbody>
        {details.map((s) => (
          <tr key={s._id}>
            <td style={{ fontWeight: '500' }}>{s.name}</td>
            <td>{s.category}</td>
            <td>{s.owner?.name || '—'}</td>
            <td>
              <StatusBadge status={s.status} />
            </td>
            <td>{formatDate(s.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderLessonTable = () => (
    <table className="table">
      <thead>
        <tr>
          <th>Thứ tự</th>
          <th>Tên bài học</th>
          <th>Khóa học</th>
          <th>Loại bài học</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {details.map((l) => (
          <tr key={l._id}>
            <td>{l.order}</td>
            <td style={{ fontWeight: '500' }}>{l.title}</td>
            <td>{l.subject?.name || '—'}</td>
            <td>
              {l.type === 'Video' ? 'Video' : l.type === 'HTML' ? 'Nội dung HTML' : 'Quiz'}
            </td>
            <td>
              <span className={`badge ${l.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                {l.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderEnrolledTable = () => (
    <table className="table">
      <thead>
        <tr>
          <th>Họ và tên</th>
          <th>Email</th>
          <th>Khóa học đang học</th>
          <th>Ngày đăng ký</th>
          <th>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {details.map((r) => (
          <tr key={r._id}>
            <td style={{ fontWeight: '500' }}>{r.student?.name || r.fullName || '—'}</td>
            <td>{r.student?.email || r.email || '—'}</td>
            <td>{r.subject?.name || '—'}</td>
            <td>{formatDate(r.registeredAt || r.createdAt)}</td>
            <td>
              <span className="badge badge-success">Đã duyệt</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderTableContent = () => {
    if (loadingDetails) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải chi tiết...</div>;
    if (detailsError) return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>{detailsError}</div>;
    if (details.length === 0) return <div style={{ padding: '2rem', textAlign: 'center' }}>Không có dữ liệu để hiển thị</div>;

    if (['users', 'admins', 'managers', 'teachers', 'students'].includes(activeCard)) return renderUserTable();
    if (['subjects', 'publishedSubjects', 'draftSubjects'].includes(activeCard)) return renderSubjectTable();
    if (activeCard === 'lessons') return renderLessonTable();
    if (activeCard === 'enrolledStudents') return renderEnrolledTable();
    return null;
  };

  const getActiveCardTitle = () => {
    const c = cards.find(x => x.id === activeCard);
    return c ? c.title : '';
  };

  // ─── Main Render ────────────────────────────────────────────────────────────
  if (loadingOverview) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p className="state-subtitle">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  if (overviewError) {
    return (
      <div className="state-container">
        <div className="state-icon">⚠️</div>
        <p className="state-subtitle">{overviewError}</p>
        <button className="btn btn-primary" onClick={fetchOverview}>Thử lại</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">{isManager ? 'Bảng điều khiển Quản lý' : 'Bảng điều khiển Admin'}</h1>
          <p className="page-subtitle">Tổng quan hệ thống OnlineLearn</p>
        </div>
      </div>

      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .dashboard-card {
          background: #111827;
          border: 1px solid #263244;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .dashboard-card:hover {
          transform: translateY(-2px);
          border-color: #6366f1;
        }
        .dashboard-card.active {
          border-color: #7c3aed;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.18);
        }
        .card-icon {
          font-size: 24px;
          margin-bottom: 12px;
          background: rgba(255,255,255,0.05);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }
        .card-count {
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 4px;
        }
        .card-title-text {
          font-size: 14px;
          font-weight: 600;
          color: #9ca3af;
          margin-bottom: 4px;
        }
        .card-desc {
          font-size: 12px;
          color: #6b7280;
        }
      `}</style>

      {/* ── Cards Grid ── */}
      <div className="dashboard-grid">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            className={`dashboard-card ${activeCard === card.id ? 'active' : ''}`}
            onClick={() => setActiveCard(card.id)}
          >
            <div className="card-icon">{card.icon}</div>
            <div className="card-count">{card.count}</div>
            <div className="card-title-text">{card.title}</div>
            <div className="card-desc">{card.desc}</div>
          </div>
        ))}
      </div>

      {/* ── Details Section ── */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <h2 className="card-title">Chi tiết: {getActiveCardTitle()}</h2>
        </div>
        <div className="table-wrapper" style={{ padding: '0 20px 20px 20px' }}>
          {renderTableContent()}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
