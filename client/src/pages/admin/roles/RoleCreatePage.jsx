import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { roleApi } from '../../../api/roleApi';
import { useToast } from '../../../components/common/Toast';
import RoleForm from '../../../components/roles/RoleForm';
import './RoleManagement.css';

const RoleCreatePage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      await roleApi.createRole(formData);
      showToast('Tạo vai trò thành công', 'success');
      navigate('/admin/roles');
    } catch (error) {
      showToast(error.response?.data?.message || 'Lỗi khi tạo vai trò', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="role-breadcrumbs">
        <Link to="/admin/roles">Vai trò</Link>
        <span className="role-breadcrumbs-separator">›</span>
        <span className="role-breadcrumbs-current">Thêm mới</span>
      </div>

      <div className="page-header" style={{ marginBottom: '16px' }}>
        <h1 className="page-title">Thêm vai trò mới</h1>
        <p className="page-subtitle">Tạo một vai trò mới trong hệ thống OnlineLearn</p>
      </div>

      <div className="role-form-container">
        <div className="role-form-card">
          <RoleForm onSubmit={handleSubmit} loading={loading} isEdit={false} />
        </div>
      </div>
    </div>
  );
};

export default RoleCreatePage;

