import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { roleApi } from '../../../api/roleApi';
import { useToast } from '../../../components/common/Toast';
import RoleForm from '../../../components/roles/RoleForm';
import './RoleManagement.css';

const RoleEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [role, setRole] = useState(null);
  const [loadingFetch, setLoadingFetch] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await roleApi.getRoleById(id);
        setRole(res.data);
      } catch (error) {
        showToast(error.response?.data?.message || 'Lỗi khi tải dữ liệu', 'error');
        navigate('/admin/roles');
      } finally {
        setLoadingFetch(false);
      }
    };
    fetchRole();
  }, [id, navigate, showToast]);

  const handleSubmit = async (formData) => {
    try {
      setLoadingSubmit(true);
      await roleApi.updateRole(id, formData);
      showToast('Cập nhật vai trò thành công', 'success');
      navigate('/admin/roles');
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi cập nhật vai trò', 'error');
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (loadingFetch) {
    return (
      <div className="admin-page flex-center" style={{ minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="role-breadcrumbs">
        <Link to="/admin/roles">Vai trò</Link>
        <span className="role-breadcrumbs-separator">›</span>
        <Link to={`/admin/roles/${id}`}>{role?.name}</Link>
        <span className="role-breadcrumbs-separator">›</span>
        <span className="role-breadcrumbs-current">Chỉnh sửa</span>
      </div>

      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">Chỉnh sửa vai trò</h1>
        <p className="page-subtitle">Cập nhật thông tin và quyền hạn của vai trò</p>
      </div>

      <div className="role-form-container">
        <div className="role-form-card">
          <RoleForm
            initialData={role}
            onSubmit={handleSubmit}
            loading={loadingSubmit}
            isEdit={true}
          />
        </div>
      </div>
    </div>
  );
};

export default RoleEditPage;

