import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentDashboard } from '../../api/studentApi';
import { useToast } from '../../components/common/Toast';

const MyCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getStudentDashboard();
        if (response.data && response.data.data) {
          setCourses(response.data.data.continueLearning || []);
        }
      } catch (error) {
        toast.error('Lỗi', 'Không thể tải danh sách khóa học');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [toast]);

  if (loading) {
    return <div className="state-container"><div className="spinner"></div><p>Đang tải...</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Khóa học của tôi</h1>
        <p className="page-subtitle">Danh sách các khóa học bạn đã đăng ký</p>
      </div>

      <div style={{ padding: '20px' }}>
        {courses.length === 0 ? (
          <div className="state-container" style={{ padding: '2rem 0' }}>
            <div className="state-title">Bạn chưa đăng ký khóa học nào.</div>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: '15px' }}>Khám phá khóa học</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {courses.map(course => (
              <div key={course._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ height: '160px', backgroundColor: 'var(--surface-color)', backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  {!course.thumbnail && <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>}
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span className="badge badge-info" style={{ alignSelf: 'flex-start', marginBottom: '10px' }}>{course.category || 'Khóa học'}</span>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: 'var(--text-primary)' }}>{course.name}</h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Giảng viên: {course.owner?.name || '—'}</p>
                  <div style={{ marginTop: 'auto' }}>
                    <Link to={`/student/my-courses/${course._id}`} className="btn btn-primary btn-full">Tiếp tục học</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;
