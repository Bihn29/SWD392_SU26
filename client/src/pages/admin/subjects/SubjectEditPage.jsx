import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSubjectById, updateSubject } from '../../../api/subjectApi';
import { getTeacherCourseById, updateTeacherCourse } from '../../../api/teacherApi';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../components/common/Toast';
import { getRoleCode } from '../../../utils/roleRedirect';
import SubjectForm from '../../../components/subjects/SubjectForm';

const SubjectEditPage = ({ isTeacher = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const roleCode = getRoleCode(user);
  const isAdmin = roleCode === 'Admin';
  const isManager = roleCode === 'Manager';
  const basePath = isTeacher ? '/teacher/courses' : '/admin/subjects';

  const [subject, setSubject] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchSubject = async () => {
      setFetchLoading(true);
      try {
        const res = isTeacher ? await getTeacherCourseById(id) : await getSubjectById(id);
        setSubject(res.data.data);
      } catch (err) {
        setFetchError(err.response?.data?.message || 'Không thể tải chi tiết khóa học.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchSubject();
  }, [id, isTeacher]);

  const handleSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      if (isTeacher) {
        await updateTeacherCourse(id, data);
      } else {
        await updateSubject(id, data);
      }
      toast.success('Đã cập nhật!', 'Thông tin khóa học đã được cập nhật.');
      navigate(`${basePath}/${id}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Cập nhật khóa học thất bại.';
      toast.error('Cập nhật thất bại', msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="state-container">
        <div className="spinner" />
        <p className="state-subtitle">Đang tải chi tiết khóa học...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="state-container">
        <div className="state-icon">⚠️</div>
        <div className="state-title">Tải thất bại</div>
        <p className="state-subtitle">{fetchError}</p>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} id="edit-back-btn">
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <nav className="breadcrumb">
            <Link to={basePath} style={{ color: 'var(--text-muted)' }}>Khóa học</Link>
            <span className="breadcrumb-separator">›</span>
            <Link to={`${basePath}/${id}`} style={{ color: 'var(--text-muted)' }}>{subject.name}</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Sửa</span>
          </nav>
          <h1 className="page-title">Chỉnh sửa khóa học</h1>
          <p className="page-subtitle">Cập nhật thông tin và cài đặt khóa học</p>
        </div>
        <Link to={`${basePath}/${id}`} className="btn btn-secondary" id="edit-view-btn">
          👁️ Xem chi tiết
        </Link>
      </div>

      {/* ── Form Card ── */}
      <div className="card" style={{ maxWidth: '860px' }}>
        <div className="card-header">
          <h2 className="card-title">✏️ Chi tiết chỉnh sửa</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Các trường có dấu <span style={{ color: 'var(--accent-danger)' }}>*</span> là bắt buộc
          </span>
        </div>
        <SubjectForm
          initialData={subject}
          onSubmit={handleSubmit}
          loading={submitLoading}
          isEdit={true}
          canChangeStatus={isAdmin || isManager}
          isTeacher={isTeacher}
        />
      </div>
    </div>
  );
};

export default SubjectEditPage;
