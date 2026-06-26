import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { roleApi } from '../../../api/roleApi';
import { useToast } from '../../../components/common/Toast';
import StatusBadge from '../../../components/common/StatusBadge';
import Pagination from '../../../components/common/Pagination';
import ConfirmModal from '../../../components/common/ConfirmModal';
import './RoleManagement.css';

const RoleListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Summary Stats
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, system: 0 });

  // Pagination & Filters
  const queryParams = new URLSearchParams(location.search);
  const [page, setPage] = useState(Number(queryParams.get('page')) || 1);
  const [search, setSearch] = useState(queryParams.get('search') || '');
  const [status, setStatus] = useState(queryParams.get('status') || '');
  const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [roleToModify, setRoleToModify] = useState(null);
  const [actionType, setActionType] = useState(''); // 'deactivate' or 'activate'

  const fetchStats = async () => {
    try {
      const res = await roleApi.getRoles({ limit: 100 });
      const items = res.data || [];
      const total = items.length;
      const active = items.filter(r => r.status === 'Active').length;
      const inactive = items.filter(r => r.status === 'Inactive').length;
      const system = items.filter(r => r.isSystemRole).length;
      setStats({ total, active, inactive, system });
    } catch (err) {
      console.error('Error fetching role stats:', err);
    }
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await roleApi.getRoles({ page, limit: 10, search, status });
      setRoles(res.data || []);
      setPagination(res.pagination || { totalPages: 1, totalItems: 0 });
    } catch (error) {
      setError(true);
      showToast(error.response?.data?.message || 'Lỗi khi tải danh sách vai trò', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchStats();
    // Update URL
    const params = new URLSearchParams();
    if (page > 1) params.set('page', page);
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    navigate({ search: params.toString() }, { replace: true });
  }, [page, search, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRoles();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setPage(1);
  };

  const openConfirmModal = (role, type) => {
    setRoleToModify(role);
    setActionType(type);
    setModalOpen(true);
  };

  const confirmAction = async () => {
    if (!roleToModify) return;
    try {
      if (actionType === 'deactivate') {
        await roleApi.deactivateRole(roleToModify._id);
        showToast('Ngừng hoạt động vai trò thành công', 'success');
      } else {
        await roleApi.activateRole(roleToModify._id);
        showToast('Kích hoạt vai trò thành công', 'success');
      }
      fetchRoles();
      fetchStats();
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi thay đổi trạng thái', 'error');
    } finally {
      setModalOpen(false);
      setRoleToModify(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Quản lý vai trò</h1>
          <p className="page-subtitle">Quản lý các vai trò và quyền truy cập trong hệ thống OnlineLearn</p>
        </div>
        <Link to="/admin/roles/create" className="role-add-btn">
          <span style={{ fontSize: '18px' }}>+</span> Thêm vai trò mới
        </Link>
      </div>

      {/* Summary Stats Cards */}
      <div className="role-summary-grid">
        <div className="role-summary-card">
          <div className="role-summary-info">
            <span className="role-summary-label">Tổng vai trò</span>
            <span className="role-summary-value">{stats.total}</span>
          </div>
          <div className="role-summary-icon-container role-summary-icon-total">👥</div>
        </div>

        <div className="role-summary-card">
          <div className="role-summary-info">
            <span className="role-summary-label">Đang hoạt động</span>
            <span className="role-summary-value">{stats.active}</span>
          </div>
          <div className="role-summary-icon-container role-summary-icon-active">✅</div>
        </div>

        <div className="role-summary-card">
          <div className="role-summary-info">
            <span className="role-summary-label">Ngừng hoạt động</span>
            <span className="role-summary-value">{stats.inactive}</span>
          </div>
          <div className="role-summary-icon-container role-summary-icon-inactive">⛔</div>
        </div>

        <div className="role-summary-card">
          <div className="role-summary-info">
            <span className="role-summary-label">Vai trò hệ thống</span>
            <span className="role-summary-value">{stats.system}</span>
          </div>
          <div className="role-summary-icon-container role-summary-icon-system">⭐</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="role-filter-card">
        <form className="role-filter-form" onSubmit={handleSearchSubmit}>
          <div className="role-search-wrapper">
            <span className="role-search-icon">🔍</span>
            <input
              type="text"
              className="role-filter-input"
              placeholder="Tìm kiếm theo tên hoặc mã vai trò..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="role-filter-select"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Ngừng hoạt động</option>
          </select>
        </form>

        {(search || status) && (
          <button className="role-clear-btn" onClick={handleClearFilters}>
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Role Table */}
      <div className="role-table-card">
        <div className="role-table-container">
          <table className="role-table">
            <thead>
              <tr>
                <th>MÃ VAI TRÒ</th>
                <th>TÊN VAI TRÒ</th>
                <th>SỐ QUYỀN</th>
                <th>VAI TRÒ HỆ THỐNG</th>
                <th>TRẠNG THÁI</th>
                <th style={{ textAlign: 'right' }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <div className="spinner"></div>
                      <span style={{ color: 'var(--role-text-secondary)', fontSize: '14px' }}>Đang tải danh sách vai trò...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                    Không thể tải danh sách vai trò. Vui lòng thử lại.
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--role-text-secondary)' }}>
                    {search || status ? 'Không tìm thấy vai trò phù hợp' : 'Chưa có vai trò nào trong hệ thống'}
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id}>
                    <td style={{ fontWeight: '700', color: 'var(--role-text-primary)' }}>{role.code}</td>
                    <td style={{ fontWeight: '500' }}>{role.name}</td>
                    <td>
                      <span className="badge badge-count">
                        {role.permissions.includes('*') ? 'Tất cả quyền' : `${role.permissions.length} quyền`}
                      </span>
                    </td>
                    <td>
                      {role.isSystemRole ? (
                        <span className="badge badge-system">Có</span>
                      ) : (
                        <span className="badge badge-normal">Không</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${role.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {role.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="role-actions-container" style={{ justifyContent: 'flex-end' }}>
                        <Link to={`/admin/roles/${role._id}`} className="role-action-btn btn-view" title="Xem chi tiết">
                          👁
                        </Link>
                        <Link to={`/admin/roles/${role._id}/edit`} className="role-action-btn btn-edit" title="Chỉnh sửa">
                          ✏️
                        </Link>
                        {role.status === 'Active' ? (
                          <button
                            className="role-action-btn btn-deactivate"
                            title="Ngừng hoạt động"
                            onClick={() => openConfirmModal(role, 'deactivate')}
                          >
                            ⛔
                          </button>
                        ) : (
                          <button
                            className="role-action-btn btn-activate"
                            title="Kích hoạt"
                            onClick={() => openConfirmModal(role, 'activate')}
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      )}

      <ConfirmModal
        isOpen={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmAction}
        title={actionType === 'deactivate' ? 'Xác nhận ngừng hoạt động vai trò' : 'Xác nhận kích hoạt vai trò'}
        message={
          actionType === 'deactivate'
            ? 'Bạn có chắc chắn muốn ngừng hoạt động vai trò này không? Người dùng thuộc vai trò này có thể bị ảnh hưởng quyền truy cập.'
            : 'Bạn có chắc chắn muốn kích hoạt lại vai trò này không?'
        }
        confirmText="Xác nhận"
        confirmVariant={actionType === 'deactivate' ? 'danger' : 'success'}
      />
    </div>
  );
};

export default RoleListPage;

