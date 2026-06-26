import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PermissionCheckboxGroup from './PermissionCheckboxGroup';

const RoleForm = ({ initialData, onSubmit, loading, isEdit }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    code: '',
    description: '',
    permissions: [],
    status: 'Active',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        code: initialData.code || '',
        description: initialData.description || '',
        permissions: initialData.permissions || [],
        status: initialData.status || 'Active',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handlePermissionsChange = (perms) => {
    setForm((prev) => ({ ...prev, permissions: perms }));
    if (errors.permissions) {
      setErrors((prev) => ({ ...prev, permissions: null }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Tên vai trò là bắt buộc';
    else if (form.name.length > 100) errs.name = 'Tên vai trò không được vượt quá 100 ký tự';

    if (!form.code.trim()) errs.code = 'Mã vai trò là bắt buộc';

    if (form.description && form.description.length > 500) {
      errs.description = 'Mô tả không được vượt quá 500 ký tự';
    }

    if (!form.permissions || form.permissions.length === 0) {
      errs.permissions = 'Vui lòng chọn ít nhất một quyền';
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit(form);
  };

  const isSystemRole = initialData?.isSystemRole;

  return (
    <form onSubmit={handleSubmit}>
      <div className="role-form-section">
        <h3 className="role-form-section-title">📝 Thông tin chung</h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="role-name">
              Tên vai trò <span className="required">*</span>
            </label>
            <input
              id="role-name"
              name="name"
              type="text"
              className={`form-control ${errors.name ? 'error' : ''}`}
              placeholder="VD: Quản lý chi nhánh"
              value={form.name}
              onChange={handleChange}
              maxLength={100}
            />
            {errors.name && <span className="role-validation-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role-code">
              Mã vai trò <span className="required">*</span>
            </label>
            <input
              id="role-code"
              name="code"
              type="text"
              className={`form-control ${errors.code ? 'error' : ''}`}
              placeholder="VD: BranchManager"
              value={form.code}
              onChange={handleChange}
              disabled={isSystemRole}
            />
            {errors.code && <span className="role-validation-error">{errors.code}</span>}
            {isSystemRole && <span className="form-hint" style={{ color: 'var(--accent-warning)', marginTop: '4px' }}>Không thể thay đổi mã của vai trò hệ thống.</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="role-description">
            Mô tả
          </label>
          <textarea
            id="role-description"
            name="description"
            className={`form-control ${errors.description ? 'error' : ''}`}
            placeholder="Viết mô tả ngắn gọn về vai trò này..."
            value={form.description}
            onChange={handleChange}
            rows={3}
            maxLength={500}
          />
          {errors.description && <span className="role-validation-error">{errors.description}</span>}
        </div>

        {isEdit && (
          <div className="form-group" style={{ maxWidth: '300px' }}>
            <label className="form-label" htmlFor="role-status">Trạng thái</label>
            <select
              id="role-status"
              name="status"
              className="form-control"
              style={{
                backgroundColor: '#111827',
                color: '#f9fafb',
                border: '1px solid #2f3a4f'
              }}
              value={form.status}
              onChange={handleChange}
            >
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Ngừng hoạt động</option>
            </select>
          </div>
        )}
      </div>

      <div className="role-form-section" style={{ marginTop: '30px' }}>
        <h3 className="role-form-section-title">
          🔐 Quyền hạn <span className="required">*</span>
        </h3>
        {errors.permissions && <div className="role-validation-error" style={{ marginBottom: '15px' }}>{errors.permissions}</div>}
        
        <PermissionCheckboxGroup
          selectedPermissions={form.permissions}
          onChange={handlePermissionsChange}
          disabled={form.code === 'Admin' && isSystemRole}
        />
      </div>

      <div className="form-actions" style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/admin/roles')}
          disabled={loading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="role-add-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', marginRight: '8px' }} />
              Đang lưu...
            </>
          ) : (
            isEdit ? '💾 Lưu thay đổi' : '✨ Thêm vai trò mới'
          )}
        </button>
      </div>
    </form>
  );
};

export default RoleForm;
