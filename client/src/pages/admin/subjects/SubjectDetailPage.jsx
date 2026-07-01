import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { getSubjectById, publishSubject, unpublishSubject, deleteSubject } from '../../../api/subjectApi';
import { getTeacherCourseById, deleteTeacherCourse } from '../../../api/teacherApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/common/Toast';
import StatusBadge from '../../../components/common/StatusBadge';
import ConfirmModal from '../../../components/common/ConfirmModal';
import SubjectLessonsTab from '../../../components/subjects/SubjectLessonsTab';
import SubjectStudentsTab from '../../../components/subjects/SubjectStudentsTab';

const SubjectDetailPage = ({ isTeacher = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'Admin';
  const basePath = isTeacher ? '/teacher/courses' : '/admin/subjects';
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = searchParams.get('tab') || 'info';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: '' });

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = isTeacher ? await getTeacherCourseById(id) : await getSubjectById(id);
        setSubject(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải khóa học.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (modal.type === 'publish') {
        await publishSubject(id);
        setSubject((prev) => ({ ...prev, status: 'Published' }));
        toast.success('Đã xuất bản', 'Khóa học đã được xuất bản.');
      } else if (modal.type === 'unpublish') {
        await unpublishSubject(id);
        setSubject((prev) => ({ ...prev, status: 'Unpublished' }));
        toast.warning('Đã hủy xuất bản', 'Khóa học đã hủy xuất bản.');
      } else if (modal.type === 'deactivate') {
        if (isTeacher) {
          await deleteTeacherCourse(id);
        } else {
          await deleteSubject(id);
        }
        toast.success('Đã ngừng hoạt động', 'Khóa học đã ngừng hoạt động.');
        navigate(basePath);
        return;
      }
      setModal({ isOpen: false, type: '' });
    } catch (err) {
      toast.error('Thao tác thất bại', err.response?.data?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  const MODAL_CONFIG = {
    publish:    { title: 'Xuất bản khóa học', message: `Xuất bản "${subject?.name}"?`, confirmText: 'Xuất bản', confirmVariant: 'success' },
    unpublish:  { title: 'Hủy xuất bản khóa học', message: `Hủy xuất bản "${subject?.name}"?`, confirmText: 'Hủy xuất bản', confirmVariant: 'warning' },
    deactivate: { title: 'Ngừng hoạt động khóa học', message: `Bạn có chắc chắn muốn ngừng hoạt động "${subject?.name}"? Khóa học sẽ bị ẩn với tất cả người dùng.`, confirmText: 'Ngừng hoạt động', confirmVariant: 'danger' },
  };
  const cfg = MODAL_CONFIG[modal.type] || {};

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p className="state-subtitle">Đang tải chi tiết khóa học...</p>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="state-container">
        <div className="state-icon">⚠️</div>
        <div className="state-title">Không tìm thấy khóa học</div>
        <p className="state-subtitle">{error}</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} id="detail-back-btn">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <nav className="breadcrumb">
            <Link to={basePath} style={{ color: 'var(--text-muted)' }}>Khóa học</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{subject.name}</span>
          </nav>
          <h1 className="page-title" style={{ maxWidth: '600px' }}>{subject.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <StatusBadge status={subject.status} />
            {subject.featured && <span className="badge badge-featured">⭐ Nổi bật</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link to={`${basePath}/${id}/edit`} className="btn btn-secondary" id="detail-edit-btn">
            ✏️ Sửa
          </Link>
          {isAdmin && subject.status !== 'Published' && subject.status !== 'Inactive' && (
            <button className="btn btn-success" onClick={() => setModal({ isOpen: true, type: 'publish' })} id="detail-publish-btn">
              🚀 Xuất bản
            </button>
          )}
          {isAdmin && subject.status === 'Published' && (
            <button className="btn btn-warning" onClick={() => setModal({ isOpen: true, type: 'unpublish' })} id="detail-unpublish-btn">
              📤 Hủy xuất bản
            </button>
          )}
          {isAdmin && subject.status !== 'Inactive' && (
            <button className="btn btn-danger" onClick={() => setModal({ isOpen: true, type: 'deactivate' })} id="detail-deactivate-btn">
              🗑️ Ngừng hoạt động
            </button>
          )}
          {isTeacher && (
            <button className="btn btn-danger" onClick={() => setModal({ isOpen: true, type: 'deactivate' })} id="detail-deactivate-btn">
              🗑️ Xóa khóa học
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
        <button
          className={`btn btn-ghost ${activeTab === 'info' ? 'active-tab' : ''}`}
          style={{ borderBottom: activeTab === 'info' ? '2px solid var(--primary-color)' : 'none', borderRadius: 0, paddingBottom: '10px' }}
          onClick={() => setActiveTab('info')}
        >
          Thông tin khóa học
        </button>
        <button
          className={`btn btn-ghost ${activeTab === 'lessons' ? 'active-tab' : ''}`}
          style={{ borderBottom: activeTab === 'lessons' ? '2px solid var(--primary-color)' : 'none', borderRadius: 0, paddingBottom: '10px' }}
          onClick={() => setActiveTab('lessons')}
        >
          Bài học
        </button>
        <button
          className={`btn btn-ghost ${activeTab === 'students' ? 'active-tab' : ''}`}
          style={{ borderBottom: activeTab === 'students' ? '2px solid var(--primary-color)' : 'none', borderRadius: 0, paddingBottom: '10px' }}
          onClick={() => setActiveTab('students')}
        >
          Học viên
        </button>
      </div>

      {/* ── Detail Grid ── */}
      {activeTab === 'info' && (
      <div className="detail-grid">
        {/* Left: Info */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📋 Thông tin khóa học</h2>
          </div>

          <div className="detail-field">
            <span className="detail-label">Tên khóa học</span>
            <span className="detail-value" id="detail-name">{subject.name}</span>
          </div>

          <div className="detail-field">
            <span className="detail-label">Danh mục</span>
            <span className="detail-value" id="detail-category">{subject.category}</span>
          </div>

          <div className="detail-field">
            <span className="detail-label">Chuyên gia phụ trách</span>
            <span className="detail-value" id="detail-owner">
              {subject.owner?.name || '—'}
              {subject.owner?.email && (
                <span style={{ color: 'var(--text-muted)', fontSize: '12px', display: 'block' }}>
                  {subject.owner.email}
                </span>
              )}
            </span>
          </div>

          <div className="detail-field">
            <span className="detail-label">Nổi bật</span>
            <span className="detail-value" id="detail-featured">
              {subject.featured ? '⭐ Có – Khóa học nổi bật' : 'Không'}
            </span>
          </div>

          <div className="detail-field">
            <span className="detail-label">Trạng thái</span>
            <StatusBadge status={subject.status} />
          </div>

          {subject.description && (
            <div className="detail-field">
              <span className="detail-label">Mô tả</span>
              <p className="detail-value" id="detail-description" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}>
                {subject.description}
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            <div className="detail-field">
              <span className="detail-label">Ngày tạo</span>
              <span className="detail-value text-sm" id="detail-created-at">{formatDate(subject.createdAt)}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Ngày cập nhật</span>
              <span className="detail-value text-sm" id="detail-updated-at">{formatDate(subject.updatedAt)}</span>
            </div>
          </div>

          {subject.createdBy && (
            <div className="detail-field">
              <span className="detail-label">Người tạo</span>
              <span className="detail-value text-sm">{subject.createdBy?.name || '—'}</span>
            </div>
          )}
        </div>

        {/* Right: Thumbnail + Meta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🖼️ Ảnh thu nhỏ</h2>
            </div>
            {subject.thumbnail ? (
              <img
                className="detail-thumbnail"
                src={subject.thumbnail}
                alt={subject.name}
                id="detail-thumbnail"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="detail-thumbnail-placeholder"
              style={{ display: subject.thumbnail ? 'none' : 'flex' }}
              id="detail-thumbnail-placeholder"
            >
              📚
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🔑 ID Hệ thống</h2>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', wordBreak: 'break-all' }} id="detail-id">
              {subject._id}
            </p>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'lessons' && (
        <SubjectLessonsTab subjectId={id} isAdmin={isAdmin} isTeacher={isTeacher} />
      )}

      {activeTab === 'students' && (
        <SubjectStudentsTab subjectId={id} isTeacher={isTeacher} />
      )}

      <ConfirmModal
        isOpen={modal.isOpen}
        title={cfg.title}
        message={cfg.message}
        confirmText={cfg.confirmText}
        confirmVariant={cfg.confirmVariant}
        onConfirm={handleAction}
        onCancel={() => setModal({ isOpen: false, type: '' })}
        loading={actionLoading}
      />
    </div>
  );
};

export default SubjectDetailPage;
