import { useState, useEffect, useCallback } from 'react';
import { getStudentsBySubject } from '../../api/registrationApi';
import { getTeacherCourseStudents } from '../../api/teacherApi';

const SubjectStudentsTab = ({ subjectId, isTeacher = false }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = isTeacher ? await getTeacherCourseStudents(subjectId) : await getStudentsBySubject(subjectId);
      setStudents(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  }, [subjectId]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB') : '—';

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải danh sách học viên...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="card-title">Danh sách học viên</h2>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Tổng số học viên: <strong>{students.length}</strong>
        </span>
      </div>

      {students.length === 0 ? (
        <div className="state-container" style={{ padding: '3rem 0' }}>
          <div className="state-icon">📭</div>
          <div className="state-title">Chưa có học viên nào đăng ký khóa học này</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {students.map(st => (
                <tr key={st._id}>
                  <td style={{ fontWeight: '500' }}>{st.fullName}</td>
                  <td>{st.email}</td>
                  <td>{st.phone}</td>
                  <td>{formatDate(st.registeredAt)}</td>
                  <td>
                    <span className="badge badge-success">
                      {st.registrationStatus === 'Approved' ? 'Đã duyệt' : st.registrationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubjectStudentsTab;
