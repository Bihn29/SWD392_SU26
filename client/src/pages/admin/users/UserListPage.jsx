import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../../components/common/Toast';
import { ROLE_LABELS } from '../../../utils/statusLabels';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', { withCredentials: true });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, { withCredentials: true });
      toast.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      toast.error('Lỗi khi xóa người dùng');
    }
  };

  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    acc.Total = (acc.Total || 0) + 1;
    return acc;
  }, { Total: 0 });

  const ROLES_TO_SHOW = ['Admin', 'Manager', 'Teacher', 'Student'];

  const filteredUsers = selectedRole ? users.filter(u => u.role === selectedRole) : users;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý Người dùng & Vai trò</h1>
          <p className="page-subtitle">Danh sách tất cả người dùng trong hệ thống</p>
        </div>
        <Link to="/admin/users/create" className="btn btn-primary">
          + Thêm người dùng
        </Link>
      </div>

      {/* Bảng phân loại / Thống kê */}
      {!loading && users.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div 
            className="card" 
            style={{ 
              padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
              border: selectedRole === null ? '2px solid #6c63ff' : '2px solid transparent',
              borderLeft: selectedRole === null ? '2px solid #6c63ff' : '4px solid #6c63ff'
            }}
            onClick={() => setSelectedRole(null)}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{roleCounts.Total || 0}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>Tất cả</div>
          </div>
          {ROLES_TO_SHOW.map((role) => (
            <div 
              key={role} 
              className="card" 
              style={{ 
                padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                border: selectedRole === role ? '2px solid #6c63ff' : '2px solid transparent'
              }}
              onClick={() => setSelectedRole(role)}
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{roleCounts[role] || 0}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>{ROLE_LABELS[role]}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>TÊN NGƯỜI DÙNG</th>
                  <th>EMAIL</th>
                  <th>VAI TRÒ</th>
                  <th>TRẠNG THÁI</th>
                  <th style={{ textAlign: 'right' }}>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(108, 99, 255, 0.1)', color: '#6c63ff' }}>
                        {ROLE_LABELS[user.role] || user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: user.isActive ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                          color: user.isActive ? '#2ed573' : '#ff4757',
                        }}
                      >
                        {user.isActive ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/admin/users/${user._id}/edit`} className="btn btn-icon btn-ghost">
                        ✏️
                      </Link>
                      <button onClick={() => handleDelete(user._id)} className="btn btn-icon btn-ghost">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserListPage;
