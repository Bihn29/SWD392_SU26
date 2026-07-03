import { useState, useEffect, useCallback } from 'react';
import { getStudentsBySubject, getStudentDetailedProgress as getAdminDetailedProgress } from '../../api/registrationApi';
import { getTeacherCourseStudents, approveStudentRegistration, rejectStudentRegistration, getTeacherCourseStudentDetailedProgress as getTeacherDetailedProgress } from '../../api/teacherApi';
import { useToast } from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';

const SubjectStudentsTab = ({ subjectId, isTeacher = false }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const [actionLoading, setActionLoading] = useState(false);
  const [approveModal, setApproveModal] = useState({ isOpen: false, regId: null, name: '' });
  const [rejectModal, setRejectModal] = useState({ isOpen: false, regId: null, name: '', reason: '' });
  const [progressModal, setProgressModal] = useState({ isOpen: false, studentId: null, name: '', data: [] });

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
  }, [subjectId, isTeacher]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleApprove = async () => {
    if (!approveModal.regId) return;
    setActionLoading(true);
    try {
      await approveStudentRegistration(subjectId, approveModal.regId);
      toast.success('Thành công', 'Đã duyệt đăng ký của học viên.');
      setApproveModal({ isOpen: false, regId: null, name: '' });
      fetchStudents();
    } catch (err) {
      toast.error('Thất bại', err.response?.data?.message || 'Lỗi khi duyệt đăng ký.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.regId) return;
    if (!rejectModal.reason.trim()) {
      toast.warning('Cảnh báo', 'Vui lòng nhập lý do từ chối.');
      return;
    }
    setActionLoading(true);
    try {
      await rejectStudentRegistration(subjectId, rejectModal.regId, { rejectedReason: rejectModal.reason });
      toast.success('Thành công', 'Đã từ chối đăng ký của học viên.');
      setRejectModal({ isOpen: false, regId: null, name: '', reason: '' });
      fetchStudents();
    } catch (err) {
      toast.error('Thất bại', err.response?.data?.message || 'Lỗi khi từ chối đăng ký.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewProgress = async (studentId, name) => {
    try {
      const res = isTeacher ? await getTeacherDetailedProgress(subjectId, studentId) : await getAdminDetailedProgress(subjectId, studentId);
      setProgressModal({ isOpen: true, studentId, name, data: res.data.data });
    } catch (err) {
      toast.error('Lỗi khi lấy dữ liệu điểm');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '—';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved': return <span className="badge badge-success">Đã duyệt</span>;
      case 'Pending': return <span className="badge badge-warning">Chờ duyệt</span>;
      case 'Rejected': return <span className="badge badge-danger">Đã từ chối</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

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
                <th>Tiến độ</th>
                <th>Điểm số</th>
                <th>Trạng thái</th>
                {isTeacher && <th>Hành động</th>}
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
                    {st.registrationStatus === 'Approved' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '100%', height: '8px', backgroundColor: '#e9ecef', borderRadius: '4px', overflow: 'hidden', minWidth: '60px' }}>
                          <div style={{ height: '100%', backgroundColor: 'var(--success)', width: `${st.progressPercent || 0}%` }}></div>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>{st.progressPercent || 0}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td style={{ fontWeight: 'bold', color: st.averageScore >= 50 ? 'var(--success)' : (st.averageScore !== null ? 'var(--danger)' : 'inherit') }}>
                    {st.registrationStatus === 'Approved' ? (st.averageScore !== null ? `${st.averageScore}/100` : '—') : '—'}
                  </td>
                  <td>
                    {getStatusBadge(st.registrationStatus)}
                    {st.registrationStatus === 'Rejected' && st.rejectedReason && (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Lý do: {st.rejectedReason}
                      </div>
                    )}
                  </td>
                  {isTeacher && (
                    <td>
                      {st.registrationStatus === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setApproveModal({ isOpen: true, regId: st.registrationId, name: st.fullName })}
                            disabled={actionLoading}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            ✅ Duyệt
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => setRejectModal({ isOpen: true, regId: st.registrationId, name: st.fullName, reason: '' })}
                            disabled={actionLoading}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            ❌ Từ chối
                          </button>
                        </div>
                      ) : st.registrationStatus === 'Approved' ? (
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleViewProgress(st._id, st.fullName)}
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          📊 Bảng điểm
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={approveModal.isOpen}
        title="Duyệt đăng ký"
        message={`Bạn có chắc chắn muốn duyệt đăng ký của học viên ${approveModal.name}?`}
        confirmText="Duyệt"
        confirmVariant="success"
        onConfirm={handleApprove}
        onCancel={() => setApproveModal({ isOpen: false, regId: null, name: '' })}
        loading={actionLoading}
      />

      {rejectModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Từ chối đăng ký</h3>
            <p className="modal-message">
              Vui lòng nhập lý do từ chối học viên {rejectModal.name}:
            </p>
            <textarea
              className="form-input"
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Lý do từ chối..."
              rows={3}
              style={{ width: '100%', marginTop: '10px', marginBottom: '15px' }}
            />
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setRejectModal({ isOpen: false, regId: null, name: '', reason: '' })}
                disabled={actionLoading}
              >
                Hủy
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading ? 'Đang xử lý...' : 'Từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

      {progressModal.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <h3 className="modal-title">Bảng điểm chi tiết: {progressModal.name}</h3>
            
            <div className="table-wrapper" style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên bài học</th>
                    <th>Loại</th>
                    <th>Trạng thái</th>
                    <th>Điểm số</th>
                    <th>Ngày hoàn thành</th>
                  </tr>
                </thead>
                <tbody>
                  {progressModal.data.map((p, idx) => (
                    <tr key={p.lessonId}>
                      <td>{idx + 1}</td>
                      <td style={{ fontWeight: '500' }}>{p.title}</td>
                      <td>
                        {p.type === 'Quiz' ? <span className="badge badge-warning">Quiz</span> : <span className="badge badge-primary">{p.type}</span>}
                      </td>
                      <td>
                        {p.isCompleted ? <span style={{ color: 'var(--success)' }}>✔ Đã học</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td style={{ fontWeight: 'bold' }}>
                        {p.type === 'Quiz' ? (p.score !== null ? `${p.score}/100` : '—') : '—'}
                      </td>
                      <td>{p.completedAt ? new Date(p.completedAt).toLocaleString('vi-VN') : '—'}</td>
                    </tr>
                  ))}
                  {progressModal.data.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Khóa học chưa có bài học nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setProgressModal({ isOpen: false, studentId: null, name: '', data: [] })}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectStudentsTab;
