import { useState, useEffect } from 'react';
import { getTeacherDashboard } from '../../api/teacherApi';
import { useToast } from '../../components/common/Toast';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';

const TeacherDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [latestSubjects, setLatestSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getTeacherDashboard();
        setStats(response.data.data.stats);
        setLatestSubjects(response.data.data.latestSubjects || []);
      } catch (error) {
        toast.error('Lỗi', 'Không thể tải dữ liệu dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Tổng quan</h1>
          <p className="page-subtitle">Xem tình hình các khóa học của bạn</p>
        </div>
      </div>

      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-label">Tổng khóa học</span>
            <span className="stat-value">{stats?.totalSubjects || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-info">
            <span className="stat-label">Khóa học đã xuất bản</span>
            <span className="stat-value">{stats?.publishedSubjects || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎥</div>
          <div className="stat-info">
            <span className="stat-label">Tổng bài học</span>
            <span className="stat-value">{stats?.totalLessons || 0}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <span className="stat-label">Học viên tham gia</span>
            <span className="stat-value">{stats?.totalEnrolledStudents || 0}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="card-title">Khóa học mới nhất</h2>
          <Link to="/teacher/courses" className="btn btn-ghost btn-sm">Xem tất cả</Link>
        </div>
        {latestSubjects.length === 0 ? (
          <div className="state-container" style={{ padding: '2rem 0' }}>
            <div className="state-title">Bạn chưa có khóa học nào</div>
            <Link to="/teacher/courses/create" className="btn btn-primary" style={{ marginTop: '10px' }}>
              Tạo khóa học đầu tiên
            </Link>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Danh mục</th>
                  <th>Bài học</th>
                  <th>Học viên</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {latestSubjects.map(sub => (
                  <tr key={sub._id}>
                    <td>
                      <Link to={`/teacher/courses/${sub._id}`} style={{ fontWeight: '500', color: 'var(--primary-color)' }}>
                        {sub.name}
                      </Link>
                    </td>
                    <td>{sub.category}</td>
                    <td>{sub.lessonCount || 0}</td>
                    <td>{sub.studentCount || 0}</td>
                    <td>
                      <StatusBadge status={sub.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link to={`/teacher/courses/${sub._id}`} className="btn btn-ghost btn-sm">Xem</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboardPage;
