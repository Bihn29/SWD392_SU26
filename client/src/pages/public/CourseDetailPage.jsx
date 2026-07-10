import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicSubjectById } from '../../api/subjectApi';
import { enrollCourse, checkEnrollment } from '../../api/studentApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';
import { getRoleCode } from '../../utils/roleRedirect';

const CourseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null); // null, 'enrolled', 'not_enrolled'
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await getPublicSubjectById(id);
        if (response.data && response.data.data) {
          setCourse(response.data.data);
        }

        // Nếu đã đăng nhập là Student, kiểm tra trạng thái đăng ký
        const roleCode = getRoleCode(user);
        if (isAuthenticated && roleCode === 'Student') {
          const enrollRes = await checkEnrollment(id);
          if (enrollRes.data && enrollRes.data.data) {
            setEnrollmentStatus(enrollRes.data.data.isEnrolled ? 'enrolled' : 'not_enrolled');
          }
        }
      } catch (error) {
        toast.error('Lỗi', 'Không thể tải thông tin khóa học.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [id, isAuthenticated, user]);

  const handleEnrollClick = async () => {
    if (!isAuthenticated) {
      toast.info('Thông báo', 'Vui lòng đăng nhập để đăng ký khóa học.');
      navigate('/login');
      return;
    }

    const roleCode = getRoleCode(user);
    if (roleCode !== 'Student') {
      toast.error('Từ chối truy cập', 'Chỉ học viên (Student) mới có thể đăng ký khóa học.');
      return;
    }

    if (enrollmentStatus === 'enrolled') {
      navigate(`/student/my-courses/${id}`);
      return;
    }

    setEnrolling(true);
    try {
      await enrollCourse(id);
      toast.success('Thành công', 'Đăng ký khóa học thành công!');
      setEnrollmentStatus('enrolled');
      // Tùy chọn: Chuyển hướng học viên vào khóa học luôn
      navigate(`/student/my-courses/${id}`);
    } catch (error) {
      toast.error('Lỗi', error.response?.data?.message || 'Không thể đăng ký khóa học.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="state-container" style={{ padding: '4rem 0' }}>
        <div className="spinner"></div>
        <p>Đang tải chi tiết khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="state-container" style={{ padding: '4rem 0' }}>
        <div className="state-title">Không tìm thấy khóa học</div>
        <p className="state-description">Khóa học không tồn tại hoặc đã bị gỡ.</p>
        <button onClick={() => navigate('/courses')} className="btn btn-primary" style={{ marginTop: '15px' }}>Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <button onClick={() => navigate('/courses')} className="btn btn-ghost" style={{ marginBottom: '20px' }}>
        ← Quay lại danh sách
      </button>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Left Column: Image & Details */}
        <div style={{ flex: '2', minWidth: '300px' }}>
          <div style={{ width: '100%', height: '300px', backgroundColor: 'var(--surface-color)', backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
            {!course.thumbnail && <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>}
          </div>

          <div className="card" style={{ padding: '25px', marginBottom: '20px' }}>
            <h2 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: '24px' }}>Mô tả khóa học</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {course.description || 'Chưa có mô tả cho khóa học này.'}
            </p>
          </div>
        </div>

        {/* Right Column: Info & Action */}
        <div style={{ flex: '1', minWidth: '280px' }}>
          <div className="card" style={{ padding: '25px', position: 'sticky', top: '20px' }}>
            <div style={{ marginBottom: '15px' }}>
              <span className="badge badge-info">{course.category || 'Chung'}</span>
            </div>
            <h1 style={{ margin: '0 0 15px 0', fontSize: '28px', color: 'var(--text-primary)', lineHeight: '1.3' }}>{course.name}</h1>
            
            <div style={{ margin: '20px 0', padding: '15px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Giảng viên:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{course.owner?.name || '—'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Ngày tạo:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{new Date(course.createdAt).toLocaleDateString('vi-VN')}</strong>
              </div>
            </div>

            <button 
              className={`btn ${enrollmentStatus === 'enrolled' ? 'btn-success' : 'btn-primary'}`} 
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '16px' }}
              onClick={handleEnrollClick}
              disabled={enrolling}
            >
              {enrolling ? 'Đang xử lý...' : 
               enrollmentStatus === 'enrolled' ? 'Tiếp tục học' : 'Đăng ký học ngay'}
            </button>
            
            {!isAuthenticated && (
              <p style={{ textAlign: 'center', margin: '15px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Bạn cần đăng nhập để đăng ký.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
