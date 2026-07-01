import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentDashboard } from '../../api/studentApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';

const StudentHomePage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState({
    stats: {
      totalEnrolled: 0,
      totalLearning: 0,
      totalCompleted: 0
    },
    continueLearning: [],
    featuredCourses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getStudentDashboard();
        if (response.data && response.data.data) {
          setData(response.data.data);
        }
      } catch (error) {
        toast.error('Lỗi', 'Không thể tải dữ liệu trang chủ');
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

  const { stats, continueLearning, featuredCourses } = data;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Xin chào {user?.name || user?.fullName || 'Học viên'}! 👋</h1>
          <p className="page-subtitle">Chào mừng bạn quay trở lại. Hãy tiếp tục hành trình học tập của mình nhé.</p>
        </div>
      </div>

      <div className="dashboard-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-info">
            <span className="stat-label">Đã đăng ký</span>
            <span className="stat-value">{stats.totalEnrolled}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📖</div>
          <div className="stat-info">
            <span className="stat-label">Đang học</span>
            <span className="stat-value">{stats.totalLearning}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <span className="stat-label">Hoàn thành</span>
            <span className="stat-value">{stats.totalCompleted}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '30px' }}>
        <div className="card-header">
          <h2 className="card-title">Tiếp tục học</h2>
        </div>
        <div style={{ padding: '20px' }}>
          {continueLearning.length === 0 ? (
            <div className="state-container" style={{ padding: '2rem 0' }}>
              <div className="state-title">Bạn chưa đăng ký khóa học nào.</div>
              <Link to="/courses" className="btn btn-primary" style={{ marginTop: '15px' }}>Khám phá khóa học</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {continueLearning.map(course => (
                <div key={course._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ height: '140px', backgroundColor: 'var(--surface-color)', backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: '1px solid var(--border-color)' }}>
                    {!course.thumbnail && <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>}
                  </div>
                  <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--text-primary)' }}>{course.name}</h3>
                    <p style={{ margin: '0 0 15px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Giảng viên: {course.owner?.name || '—'}</p>
                    <div style={{ marginTop: 'auto' }}>
                      <Link to={`/student/my-courses/${course._id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>Tiếp tục</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Khóa học nổi bật</h2>
        </div>
        <div style={{ padding: '20px' }}>
          {featuredCourses.length === 0 ? (
            <div className="state-container" style={{ padding: '2rem 0' }}>
              <p>Chưa có khóa học nào nổi bật.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {featuredCourses.map(course => (
                <div key={course._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ height: '140px', backgroundColor: 'var(--surface-color)', backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: '1px solid var(--border-color)' }}>
                    {!course.thumbnail && <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>}
                  </div>
                  <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--text-primary)' }}>{course.name}</h3>
                    <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Giảng viên: {course.owner?.name || '—'}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '15px' }}>
                      <span>📚 {course.lessonCount} bài học</span>
                      <span>👥 {course.studentCount} học viên</span>
                    </div>
                    <div style={{ marginTop: 'auto' }}>
                      <Link to={`/courses/${course._id}`} className="btn btn-ghost btn-sm" style={{ width: '100%', border: '1px solid var(--border-color)' }}>Xem chi tiết</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHomePage;
