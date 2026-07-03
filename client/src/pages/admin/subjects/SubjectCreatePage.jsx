import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createSubject } from '../../../api/subjectApi';
import { createTeacherCourse } from '../../../api/teacherApi';
import { useToast } from '../../../components/common/Toast';
import SubjectForm from '../../../components/subjects/SubjectForm';

const SubjectCreatePage = ({ isTeacher = false }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const basePath = isTeacher ? '/teacher/courses' : '/admin/subjects';

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (isTeacher) {
        await createTeacherCourse(data);
      } else {
        await createSubject(data);
      }
      toast.success('Đã tạo khóa học!', 'Khóa học đã được tạo thành công.');
      navigate(basePath);
    } catch (err) {
      const msg = err.response?.data?.message || 'Tạo khóa học thất bại.';
      toast.error('Tạo thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="page-header-left">
          <nav className="breadcrumb">
            <Link to={basePath} style={{ color: 'var(--text-muted)' }}>Khóa học</Link>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">Thêm mới</span>
          </nav>
          <h1 className="page-title">Thêm khóa học mới</h1>
          <p className="page-subtitle">Điền thông tin chi tiết để thêm khóa học mới vào hệ thống</p>
        </div>
      </div>

      {/* ── Form Card ── */}
      <div className="card" style={{ maxWidth: '860px' }}>
        <div className="card-header">
          <h2 className="card-title">📝 Chi tiết khóa học</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Các trường có dấu <span style={{ color: 'var(--accent-danger)' }}>*</span> là bắt buộc
          </span>
        </div>
        <SubjectForm
          onSubmit={handleSubmit}
          loading={loading}
          isEdit={false}
          canChangeStatus={false}
          isTeacher={isTeacher}
        />
      </div>
    </div>
  );
};

export default SubjectCreatePage;
