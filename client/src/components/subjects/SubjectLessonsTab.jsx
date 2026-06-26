import { useState, useEffect, useCallback } from 'react';
import { getLessonsBySubject, createLesson, updateLesson, deleteLesson, activateLesson } from '../../api/lessonApi';
import { useToast } from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';

const SubjectLessonsTab = ({ subjectId, isAdmin }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [modal, setModal] = useState({ isOpen: false, type: '', lesson: null });
  const [form, setForm] = useState({ title: '', type: 'Video', order: 1, videoUrl: '', htmlContent: '' });
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getLessonsBySubject(subjectId);
      setLessons(res.data.data || []);
    } catch (err) {
      console.error('Error loading lessons:', err);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleOpenForm = (lesson = null) => {
    if (lesson) {
      setForm({
        title: lesson.title,
        type: lesson.type,
        order: lesson.order,
        videoUrl: lesson.videoUrl || '',
        htmlContent: lesson.htmlContent || ''
      });
      setIsEdit(true);
      setModal({ isOpen: false, type: '', lesson });
    } else {
      setForm({ title: '', type: 'Video', order: lessons.length + 1, videoUrl: '', htmlContent: '' });
      setIsEdit(false);
      setModal({ isOpen: false, type: '', lesson: null });
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit && modal.lesson) {
        await updateLesson(modal.lesson._id, form);
        toast.success('Cập nhật bài học thành công');
      } else {
        await createLesson(subjectId, form);
        toast.success('Thêm bài học thành công');
      }
      setShowForm(false);
      fetchLessons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleActionConfirm = async () => {
    if (!modal.lesson) return;
    try {
      if (modal.type === 'deactivate') {
        await deleteLesson(modal.lesson._id);
        toast.success('Ngừng hoạt động bài học thành công');
      } else if (modal.type === 'activate') {
        await activateLesson(modal.lesson._id);
        toast.success('Kích hoạt bài học thành công');
      }
      setModal({ isOpen: false, type: '', lesson: null });
      fetchLessons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi thao tác');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải bài học...</div>;

  return (
    <div>
      {!showForm ? (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="card-title">Danh sách bài học</h2>
            {isAdmin && (
              <button className="btn btn-primary" onClick={() => handleOpenForm()}>
                + Thêm bài học
              </button>
            )}
          </div>

          {lessons.length === 0 ? (
            <div className="state-container" style={{ padding: '3rem 0' }}>
              <div className="state-icon">📭</div>
              <div className="state-title">Chưa có bài học nào trong khóa học này</div>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Thứ tự</th>
                    <th>Tên bài học</th>
                    <th>Loại bài học</th>
                    <th>Trạng thái</th>
                    {isAdmin && <th style={{ textAlign: 'right' }}>Hành động</th>}
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((les) => (
                    <tr key={les._id}>
                      <td>{les.order}</td>
                      <td style={{ fontWeight: '500' }}>{les.title}</td>
                      <td>{les.type}</td>
                      <td>
                        {les.status === 'Active' ? (
                          <span className="badge badge-success">Hoạt động</span>
                        ) : (
                          <span className="badge badge-danger">Ngừng hoạt động</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td style={{ textAlign: 'right' }}>
                          <button className="btn btn-icon btn-ghost" onClick={() => handleOpenForm(les)} title="Sửa">
                            ✏️
                          </button>
                          {les.status === 'Active' ? (
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => setModal({ isOpen: true, type: 'deactivate', lesson: les })}
                              title="Ngừng hoạt động"
                            >
                              🗑️
                            </button>
                          ) : (
                            <button
                              className="btn btn-icon btn-ghost"
                              onClick={() => setModal({ isOpen: true, type: 'activate', lesson: les })}
                              title="Kích hoạt"
                            >
                              ✅
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <h2 className="card-title">{isEdit ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</h2>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            <div className="form-group">
              <label className="form-label">Tên bài học <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="title" className="form-control" value={form.title} onChange={handleChange} required />
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Loại bài học</label>
                <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                  <option value="Video">Video</option>
                  <option value="HTML">HTML</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Thứ tự</label>
                <input type="number" name="order" className="form-control" value={form.order} onChange={handleChange} required min="1" />
              </div>
            </div>

            {form.type === 'Video' && (
              <div className="form-group">
                <label className="form-label">Đường dẫn video (URL)</label>
                <input type="text" name="videoUrl" className="form-control" value={form.videoUrl} onChange={handleChange} />
              </div>
            )}

            {form.type === 'HTML' && (
              <div className="form-group">
                <label className="form-label">Nội dung HTML</label>
                <textarea
                  name="htmlContent"
                  className="form-control"
                  rows="6"
                  value={form.htmlContent}
                  onChange={handleChange}
                ></textarea>
              </div>
            )}

            {form.type === 'Quiz' && (
              <div className="form-group">
                <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderLeft: '4px solid #17a2b8', color: '#0c5460' }}>
                  <strong>Lưu ý:</strong> Bài quiz sẽ được cấu hình ở phân hệ Teacher sau. Hiện tại bạn chỉ cần tạo khung bài học.
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Lưu</button>
              <button type="button" className="btn btn-ghost" onClick={handleCloseForm}>Hủy</button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        isOpen={modal.isOpen}
        title={modal.type === 'deactivate' ? 'Ngừng hoạt động bài học' : 'Kích hoạt bài học'}
        message={`Bạn có chắc chắn muốn ${modal.type === 'deactivate' ? 'ngừng hoạt động' : 'kích hoạt'} bài học "${modal.lesson?.title}"?`}
        confirmText={modal.type === 'deactivate' ? 'Ngừng hoạt động' : 'Kích hoạt'}
        confirmVariant={modal.type === 'deactivate' ? 'danger' : 'success'}
        onConfirm={handleActionConfirm}
        onCancel={() => setModal({ isOpen: false, type: '', lesson: null })}
      />
    </div>
  );
};

export default SubjectLessonsTab;
