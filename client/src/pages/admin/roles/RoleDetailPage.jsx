import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { roleApi } from '../../../api/roleApi';
import { useToast } from '../../../components/common/Toast';
import { PERMISSION_GROUPS } from '../../../utils/roleLabels';
import './RoleManagement.css';

const RoleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await roleApi.getRoleById(id);
        setRole(res.data);
      } catch (error) {
        showToast(error.response?.data?.message || 'Lỗi khi tải thông tin vai trò', 'error');
        navigate('/admin/roles');
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, [id, navigate, showToast]);

  const handleDeactivate = async () => {
    try {
      await roleApi.deactivateRole(id);
      showToast('Ngừng hoạt động vai trò thành công', 'success');
      setRole((prev) => ({ ...prev, status: 'Inactive' }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi', 'error');
    }
  };

  const handleActivate = async () => {
    try {
      await roleApi.activateRole(id);
      showToast('Kích hoạt vai trò thành công', 'success');
      setRole((prev) => ({ ...prev, status: 'Active' }));
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi', 'error');
    }
  };

  if (loading) {
    return (
      <div className="admin-page flex-center" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!role) return null;

  const isAllPerms = role.permissions.includes('*');

  return (
    <div className="admin-page">
      <div className="role-breadcrumbs">
        <Link to="/admin/roles">Vai trò</Link>
        <span className="role-breadcrumbs-separator">›</span>
        <span className="role-breadcrumbs-current">{role.name}</span>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">{role.name}</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
            <span className={`badge ${role.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
              {role.status === 'Active' ? 'Hoạt động' : 'Ngừng hoạt động'}
            </span>
            {role.isSystemRole && (
              <span className="badge badge-system">
                ⭐ Vai trò hệ thống
              </span>
            )}
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <Link to={`/admin/roles/${id}/edit`} className="role-add-btn">
            ✏️ Chỉnh sửa
          </Link>
          {role.status === 'Active' ? (
            <button className="btn btn-secondary" onClick={handleDeactivate} style={{ color: 'var(--accent-danger)', borderColor: 'var(--accent-danger)' }}>
              ⛔ Ngừng hoạt động
            </button>
          ) : (
            <button className="btn btn-secondary" onClick={handleActivate} style={{ color: 'var(--accent-success)', borderColor: 'var(--accent-success)' }}>
              ✅ Kích hoạt
            </button>
          )}
        </div>
      </div>

      <div className="role-detail-grid">
        <div className="role-detail-main">
          
          <div className="role-card">
            <h3 className="card-title" style={{ marginBottom: '20px' }}>📝 Thông tin vai trò</h3>
            <div className="role-info-grid">
              <div className="role-info-item">
                <span className="role-info-label">Tên vai trò</span>
                <span className="role-info-value" style={{ fontWeight: '600' }}>{role.name}</span>
              </div>
              <div className="role-info-item">
                <span className="role-info-label">Mã vai trò</span>
                <div>
                  <span style={{ fontFamily: 'monospace', fontSize: '15px', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--role-border)', display: 'inline-block' }}>
                    {role.code}
                  </span>
                </div>
              </div>
              <div className="role-info-item" style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                <span className="role-info-label">Mô tả</span>
                <span className="role-info-value" style={{ color: 'var(--role-text-secondary)' }}>
                  {role.description || <em>Không có mô tả</em>}
                </span>
              </div>
            </div>
          </div>

          <div className="role-card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>🔐 Quyền hạn ({isAllPerms ? 'Tất cả' : role.permissions.length})</h3>
            {isAllPerms ? (
              <div style={{ padding: '16px', background: 'rgba(99,102,241,0.08)', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.2)', color: '#a5b4fc', fontWeight: 'bold' }}>
                Tất cả quyền (Admin)
              </div>
            ) : (
              <div className="role-permission-tag-container">
                {role.permissions.map((permId) => {
                  let permLabel = permId;
                  for (const group of PERMISSION_GROUPS) {
                    const found = group.permissions.find(p => p.id === permId);
                    if (found) {
                      permLabel = found.label;
                      break;
                    }
                  }
                  return (
                    <span key={permId} className="role-permission-tag">
                      {permLabel}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="role-card">
            <h3 className="card-title" style={{ marginBottom: '14px' }}>🔑 ID Hệ thống</h3>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--role-border)' }}>
              <code style={{ color: 'var(--role-text-secondary)', fontSize: '13px' }}>{role._id}</code>
            </div>
          </div>

          <div className="role-card">
            <h3 className="card-title" style={{ marginBottom: '16px' }}>🕒 Siêu dữ liệu</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="role-info-item">
                <span className="role-info-label">Ngày tạo</span>
                <span className="role-info-value">{new Date(role.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              <div className="role-info-item">
                <span className="role-info-label">Cập nhật lần cuối</span>
                <span className="role-info-value">{new Date(role.updatedAt).toLocaleString('vi-VN')}</span>
              </div>
              {role.createdBy && (
                <div className="role-info-item">
                  <span className="role-info-label">Người tạo</span>
                  <span className="role-info-value">{role.createdBy.name}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RoleDetailPage;

