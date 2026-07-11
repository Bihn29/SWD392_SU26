import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import { useToast } from '../../../components/common/Toast';
import { ROLE_LABELS } from '../../../utils/statusLabels';
import { useAuth } from '../../../contexts/AuthContext';
import { getRoleCode } from '../../../utils/roleRedirect';

const UserListPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState(null);
  const toast = useToast();

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/admin/users');
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
      await axiosInstance.delete(`/admin/users/${id}`);
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

  const roleCode = getRoleCode(user);
  const isManager = roleCode === 'Manager';
  const ROLES_TO_SHOW = isManager ? ['Manager', 'Teacher', 'Student'] : ['Admin', 'Manager', 'Teacher', 'Student'];

  const filteredUsers = selectedRole ? users.filter(u => u.role === selectedRole) : users;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isManager ? 'Quản lý Người dùng' : 'Quản lý Người dùng & Vai trò'}</h1>
          <p className="page-subtitle">{isManager ? 'Danh sách quản lý, giảng viên và học viên trong hệ thống' : 'Danh sách tất cả người dùng trong hệ thống'}</p>
        </div>
        <Link to="/admin/users/create" className="btn btn-primary">
          + Thêm người dùng
        </Link>
      </div>

      {/* Tab Switcher (Only visible to Admin who has role permission to view roles) */}
      {user?.role === 'Admin' && (
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px', paddingBottom: '2px' }}>
          <Link
            to="/admin/users"
            style={{
              padding: '8px 16px',
              textDecoration: 'none',
              color: '#f8fafc',
              fontWeight: '600',
              borderBottom: '3px solid #6c63ff',
              marginBottom: '-5px'
            }}
          >
            Người dùng
          </Link>
          <Link
            to="/admin/roles"
            style={{
              padding: '8px 16px',
              textDecoration: 'none',
              color: '#94a3b8',
              fontWeight: '500',
              borderBottom: '3px solid transparent',
              marginBottom: '-5px'
            }}
          >
            Vai trò
          </Link>
        </div>
      )}

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
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: 'rgba(108, 99, 255, 0.1)', color: '#6c63ff' }}>
                        {ROLE_LABELS[u.role] || u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: u.isActive ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 71, 87, 0.1)',
                          color: u.isActive ? '#2ed573' : '#ff4757',
                        }}
                      >
                        {u.isActive ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!(isManager && u.role === 'Manager') && (
                        <Link to={`/admin/users/${u._id}/edit`} className="btn btn-icon btn-ghost" title="Chỉnh sửa">
                          ✏️
                        </Link>
                      )}
                      {!isManager && (
                        <button onClick={() => handleDelete(u._id)} className="btn btn-icon btn-ghost" title="Xóa">
                          🗑️
                        </button>
                      )}
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
