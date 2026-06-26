import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getSubjects, deleteSubject, publishSubject, unpublishSubject } from '../../../api/subjectApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/common/Toast';
import StatusBadge from '../../../components/common/StatusBadge';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { SUBJECT_STATUS_LABELS } from '../../../utils/statusLabels';

const STATUSES = ['', 'Draft', 'Published', 'Unpublished', 'Inactive'];
const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'name', label: 'Tên khóa học' },
  { value: 'status', label: 'Trạng thái' },
];

const SubjectListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === 'Admin';

  // ─── State ──────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    featured: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
  });

  const [searchInput, setSearchInput] = useState('');

  // ─── Confirm Modal ───────────────────────────────────────────────
  const [modal, setModal] = useState({ isOpen: false, type: '', subject: null });

  // ─── Stats ──────────────────────────────────────────────────────
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, inactive: 0 });

  // ─── Fetch ──────────────────────────────────────────────────────
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filters };
      if (!params.search) delete params.search;
      if (!params.status) delete params.status;
      if (!params.featured) delete params.featured;

      const res = await getSubjects(params);
      setSubjects(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  // Fetch stats separately (all statuses)
  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      try {
        const [all, pub, draft, inactive] = await Promise.all([
          getSubjects({ limit: 1, page: 1 }),
          getSubjects({ limit: 1, page: 1, status: 'Published' }),
          getSubjects({ limit: 1, page: 1, status: 'Draft' }),
          getSubjects({ limit: 1, page: 1, status: 'Inactive' }),
        ]);
        setStats({
          total: all.data.pagination.totalItems,
          published: pub.data.pagination.totalItems,
          draft: draft.data.pagination.totalItems,
          inactive: inactive.data.pagination.totalItems,
        });
      } catch {}
    })();
  }, [isAdmin]);

  // ─── Handlers ───────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // ─── Actions ────────────────────────────────────────────────────
  const openModal = (type, subject) => setModal({ isOpen: true, type, subject });
  const closeModal = () => setModal({ isOpen: false, type: '', subject: null });

  const handleActionConfirm = async () => {
    if (!modal.subject) return;
    setActionLoading(true);
    try {
      if (modal.type === 'deactivate') {
        await deleteSubject(modal.subject._id);
        toast.success('Đã ngừng hoạt động', `"${modal.subject.name}" đã ngừng hoạt động.`);
      } else if (modal.type === 'publish') {
        await publishSubject(modal.subject._id);
        toast.success('Đã xuất bản', `"${modal.subject.name}" đã được xuất bản.`);
      } else if (modal.type === 'unpublish') {
        await unpublishSubject(modal.subject._id);
        toast.warning('Đã hủy xuất bản', `"${modal.subject.name}" đã hủy xuất bản.`);
      }
      closeModal();
      fetchSubjects();
    } catch (err) {
      toast.error('Thao tác thất bại', err.response?.data?.message || 'Đã có lỗi xảy ra.');
    } finally {
      setActionLoading(false);
    }
  };

  const MODAL_CONFIG = {
    deactivate: {
      title: 'Ngừng hoạt động khóa học',
      message: `Bạn có chắc chắn muốn ngừng hoạt động "${modal.subject?.name}"? Khóa học sẽ bị ẩn với tất cả người dùng.`,
      confirmText: 'Ngừng hoạt động',
      confirmVariant: 'danger',
    },
    publish: {
      title: 'Xuất bản khóa học',
      message: `Xuất bản "${modal.subject?.name}"? Khóa học sẽ hiển thị với tất cả người dùng.`,
      confirmText: 'Xuất bản',
      confirmVariant: 'success',
    },
    unpublish: {
      title: 'Hủy xuất bản khóa học',
      message: `Hủy xuất bản "${modal.subject?.name}"? Khóa học sẽ bị ẩn khỏi công chúng.`,
      confirmText: 'Hủy xuất bản',
      confirmVariant: 'warning',
    },
  };

  const cfg = MODAL_CONFIG[modal.type] || {};

  // ─── Render helpers ──────────────────────────────────────────────
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <nav className="breadcrumb">
            <span>Admin</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Khóa học</span>
          </nav>
          <h1 className="page-title">Quản lý khóa học</h1>
          <p className="page-subtitle">Quản lý tất cả môn học và khóa học trong hệ thống</p>
        </div>
        {isAdmin && (
          <Link to="/admin/subjects/create" className="btn btn-primary" id="add-course-btn">
            ✨ Thêm khóa học mới
          </Link>
        )}
      </div>

      {/* ── Stats Cards (Admin only) ── */}
      {isAdmin && (
        <div className="stats-grid">
          {[
            { label: 'Tổng số khóa học', value: stats.total, icon: '📚', color: 'var(--accent-primary)' },
            { label: 'Đã xuất bản', value: stats.published, icon: '✅', color: 'var(--accent-success)' },
            { label: 'Bản nháp', value: stats.draft, icon: '📝', color: 'var(--accent-warning)' },
            { label: 'Ngừng hoạt động', value: stats.inactive, icon: '🚫', color: 'var(--accent-danger)' },
          ].map(({ label, value, icon, color }) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon" style={{ background: `${color}20` }}>
                {icon}
              </div>
              <div className="stat-value" style={{ color }}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter Bar ── */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} style={{ display: 'flex', flex: 1, gap: '12px', alignItems: 'center' }}>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="subject-search-input"
              type="text"
              className="form-control"
              placeholder="Tìm kiếm khóa học..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary" id="subject-search-btn">
            Tìm kiếm
          </button>
        </form>

        <select
          id="subject-filter-status"
          className="form-control filter-select"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s ? SUBJECT_STATUS_LABELS[s] : 'Tất cả trạng thái'}</option>
          ))}
        </select>

        <select
          id="subject-filter-featured"
          className="form-control filter-select"
          value={filters.featured}
          onChange={(e) => handleFilterChange('featured', e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="true">⭐ Nổi bật</option>
          <option value="false">Không nổi bật</option>
        </select>

        <select
          id="subject-filter-sort"
          className="form-control filter-select"
          value={filters.sortBy}
          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          id="subject-filter-order-btn"
          className="btn btn-ghost"
          title={filters.order === 'desc' ? 'Mới nhất trước' : 'Cũ nhất trước'}
          onClick={() => handleFilterChange('order', filters.order === 'desc' ? 'asc' : 'desc')}
        >
          {filters.order === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {/* ── Table ── */}
      <div className="card" style={{ padding: 0 }}>
        {/* Loading */}
        {loading && (
          <div className="state-container">
            <div className="spinner" />
            <p className="state-subtitle">Đang tải khóa học...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="state-container">
            <div className="state-icon">⚠️</div>
            <div className="state-title">Đã có lỗi xảy ra</div>
            <p className="state-subtitle">{error}</p>
            <button className="btn btn-primary" onClick={fetchSubjects} id="retry-btn">
              Thử lại
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && subjects.length === 0 && (
          <div className="state-container">
            <div className="state-icon">📭</div>
            <div className="state-title">Không tìm thấy khóa học nào</div>
            <p className="state-subtitle">
              {filters.search || filters.status
                ? 'Hãy thử điều chỉnh bộ lọc của bạn.'
                : 'Tạo khóa học đầu tiên của bạn để bắt đầu.'}
            </p>
            {isAdmin && (
              <Link to="/admin/subjects/create" className="btn btn-primary" id="empty-add-btn">
                ✨ Thêm khóa học mới
              </Link>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && subjects.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Ảnh thu nhỏ</th>
                  <th>TÊN KHÓA HỌC</th>
                  <th>DANH MỤC</th>
                  <th>GIẢNG VIÊN</th>
                  <th>SỐ HỌC VIÊN</th>
                  <th>NỔI BẬT</th>
                  <th>TRẠNG THÁI</th>
                  <th>NGÀY TẠO</th>
                  <th style={{ textAlign: 'right' }}>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject._id}>
                    <td>
                      {subject.thumbnail ? (
                        <img
                          className="table-thumbnail"
                          src={subject.thumbnail}
                          alt={subject.name}
                          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                      ) : null}
                      <div className="table-thumbnail-placeholder" style={{ display: subject.thumbnail ? 'none' : 'flex' }}>
                        📚
                      </div>
                    </td>
                    <td>
                      <div className="table-name" title={subject.name}>{subject.name}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px' }}>{subject.category}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {subject.owner?.name || '—'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                      {subject.studentCount || 0}
                    </td>
                    <td>
                      {subject.featured ? (
                        <span className="badge badge-featured">⭐ Có</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={subject.status} />
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {formatDate(subject.createdAt)}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link
                          to={`/admin/subjects/${subject._id}?tab=students`}
                          className="btn btn-icon btn-ghost"
                          title="Xem học viên"
                        >
                          👥
                        </Link>
                        <Link
                          to={`/admin/subjects/${subject._id}`}
                          className="btn btn-ghost btn-sm"
                          id={`view-subject-${subject._id}-btn`}
                          title="Xem"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/admin/subjects/${subject._id}/edit`}
                          className="btn btn-secondary btn-sm"
                          id={`edit-subject-${subject._id}-btn`}
                          title="Sửa"
                        >
                          ✏️
                        </Link>
                        {isAdmin && subject.status !== 'Published' && subject.status !== 'Inactive' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => openModal('publish', subject)}
                            id={`publish-subject-${subject._id}-btn`}
                            title="Xuất bản"
                          >
                            🚀
                          </button>
                        )}
                        {isAdmin && subject.status === 'Published' && (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => openModal('unpublish', subject)}
                            id={`unpublish-subject-${subject._id}-btn`}
                            title="Hủy xuất bản"
                          >
                            📤
                          </button>
                        )}
                        {isAdmin && subject.status !== 'Inactive' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => openModal('deactivate', subject)}
                            id={`deactivate-subject-${subject._id}-btn`}
                            title="Ngừng hoạt động"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* ── Confirm Modal ── */}
      <ConfirmModal
        isOpen={modal.isOpen}
        title={cfg.title}
        message={cfg.message}
        confirmText={cfg.confirmText}
        confirmVariant={cfg.confirmVariant}
        onConfirm={handleActionConfirm}
        onCancel={closeModal}
        loading={actionLoading}
      />
    </div>
  );
};

export default SubjectListPage;
