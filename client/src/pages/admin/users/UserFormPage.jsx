import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { useToast } from '../../../components/common/Toast';
import { useAuth } from '../../../contexts/AuthContext';
import { getRoleCode } from '../../../utils/roleRedirect';

const UserFormPage = () => {
  const { user } = useAuth();
  const roleCode = getRoleCode(user);
  const isManager = roleCode === 'Manager';

  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student',
    isActive: true,
  });

  const ROLES = isManager
    ? (formData.role === 'Manager' ? ['Manager', 'Teacher', 'Student'] : ['Teacher', 'Student'])
    : ['Admin', 'Manager', 'Teacher', 'Student'];

  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      const fetchUser = async () => {
        try {
          const res = await axiosInstance.get(`/admin/users/${id}`);
          if (res.data.success) {
            const { name, email, role, isActive } = res.data.data;
            setFormData({ name, email, role, isActive, password: '' });
          }
        } catch (error) {
          toast.error('Lỗi khi tải thông tin người dùng');
          navigate('/admin/users');
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, isEdit, navigate, toast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axiosInstance.put(`/admin/users/${id}`, formData);
        toast.success('Cập nhật người dùng thành công');
      } else {
        await axiosInstance.post('/admin/users', formData);
        toast.success('Thêm người dùng thành công');
      }
      navigate('/admin/users');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? 'Chỉnh sửa người dùng' : (isManager ? 'Thêm giảng viên/học viên mới' : 'Thêm người dùng mới')}</h1>
        </div>
        <button onClick={() => navigate('/admin/users')} className="btn btn-ghost">
          Quay lại
        </button>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên người dùng <span style={{color: 'red'}}>*</span></label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email <span style={{color: 'red'}}>*</span></label>
            <input
              type="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isEdit}
            />
          </div>

          {!isEdit && (
            <div className="form-group">
              <label className="form-label">Mật khẩu <span style={{color: 'red'}}>*</span></label>
              <input
                type="password"
                name="password"
                className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
              minLength={6}
              required={!isEdit}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Vai trò</label>
            <select
              name="role"
              className="form-control"
              value={formData.role}
              onChange={handleChange}
              disabled={isManager && formData.role === 'Manager'}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              name="isActive"
              id="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label htmlFor="isActive" style={{ margin: 0, cursor: 'pointer' }}>Tài khoản đang hoạt động</label>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary">
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/admin/users')}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormPage;
