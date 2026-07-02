import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { useToast } from '../../components/common/Toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.fullName.trim()) return 'Họ và tên là bắt buộc';
    if (!formData.email.trim()) return 'Email là bắt buộc';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) return 'Email không hợp lệ';
    if (!formData.password) return 'Mật khẩu là bắt buộc';
    if (formData.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (formData.password !== formData.confirmPassword) return 'Xác nhận mật khẩu không khớp';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      showToast(error, 'error');
      return;
    }

    try {
      setLoading(true);
      await axiosInstance.post('/auth/register', formData);
      showToast('Đăng ký tài khoản thành công. Vui lòng đăng nhập.', 'success');
      navigate('/login');
    } catch (error) {
      showToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Đăng ký tài khoản</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px' }}>Bắt đầu học tập cùng OnlineLearn</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input 
              type="text" 
              name="fullName"
              className="form-control" 
              value={formData.fullName} 
              onChange={handleChange}
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              name="email"
              className="form-control" 
              value={formData.email} 
              onChange={handleChange}
              placeholder="Nhập email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Số điện thoại</label>
            <input 
              type="text" 
              name="phone"
              className="form-control" 
              value={formData.phone} 
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              name="password"
              className="form-control" 
              value={formData.password} 
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              name="confirmPassword"
              className="form-control" 
              value={formData.confirmPassword} 
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Đang xử lý...' : 'Đăng ký'}
          </button>
        </form>
        <div className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
