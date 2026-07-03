import { useState, useEffect, useCallback } from 'react';
import { getTeacherQuestions, createTeacherQuestion, updateTeacherQuestion, deleteTeacherQuestion } from '../../api/teacherApi';
import { useToast } from '../common/Toast';
import ConfirmModal from '../common/ConfirmModal';

const QuizManager = ({ subjectId, lesson, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  
  const [form, setForm] = useState({
    content: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false }
    ],
    explanation: '',
    order: 1
  });

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null });

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTeacherQuestions(subjectId, lesson._id);
      setQuestions(res.data.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [subjectId, lesson._id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleOpenForm = (q = null) => {
    if (q) {
      setForm({
        content: q.content,
        options: q.options.map(opt => ({ text: opt.text, isCorrect: opt.isCorrect })),
        explanation: q.explanation || '',
        order: q.order || 1
      });
      setCurrentQuestionId(q._id);
      setIsEdit(true);
    } else {
      setForm({
        content: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        explanation: '',
        order: questions.length + 1
      });
      setCurrentQuestionId(null);
      setIsEdit(false);
    }
    setShowForm(true);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...form.options];
    if (field === 'isCorrect') {
      // Single choice logic: if one is true, others are false
      if (value === true) {
        newOptions.forEach((opt, i) => {
          opt.isCorrect = i === index;
        });
      } else {
        newOptions[index].isCorrect = false;
      }
    } else {
      newOptions[index][field] = value;
    }
    setForm({ ...form, options: newOptions });
  };

  const addOption = () => {
    setForm({
      ...form,
      options: [...form.options, { text: '', isCorrect: false }]
    });
  };

  const removeOption = (index) => {
    const newOptions = form.options.filter((_, i) => i !== index);
    // If we removed the correct option, make the first one correct
    if (form.options[index].isCorrect && newOptions.length > 0) {
      newOptions[0].isCorrect = true;
    }
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    if (form.options.length < 2) {
      return toast.error('Câu hỏi phải có ít nhất 2 lựa chọn');
    }
    if (!form.options.some(opt => opt.isCorrect)) {
      return toast.error('Vui lòng chọn 1 đáp án đúng');
    }
    if (form.options.some(opt => !opt.text.trim())) {
      return toast.error('Không được để trống nội dung lựa chọn');
    }

    try {
      if (isEdit) {
        await updateTeacherQuestion(subjectId, lesson._id, currentQuestionId, form);
        toast.success('Cập nhật câu hỏi thành công');
      } else {
        await createTeacherQuestion(subjectId, lesson._id, form);
        toast.success('Thêm câu hỏi thành công');
      }
      setShowForm(false);
      fetchQuestions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteTeacherQuestion(subjectId, lesson._id, deleteModal.id);
      toast.success('Đã xóa câu hỏi');
      fetchQuestions();
    } catch (error) {
      toast.error('Lỗi khi xóa câu hỏi');
    } finally {
      setDeleteModal({ isOpen: false, id: null });
    }
  };

  return (
    <div className="quiz-manager">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ marginBottom: '10px' }}>
            ← Quay lại danh sách bài học
          </button>
          <h2 className="page-title">Quản lý Quiz: {lesson.title}</h2>
        </div>
        {!showForm && (
          <button className="btn btn-primary" onClick={() => handleOpenForm()}>
            + Thêm câu hỏi
          </button>
        )}
      </div>

      {showForm ? (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card-header">
            <h3 className="card-title">{isEdit ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}</h3>
          </div>
          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            <div className="form-group">
              <label className="form-label">Nội dung câu hỏi <span style={{ color: 'red' }}>*</span></label>
              <textarea 
                className="form-control" 
                rows="3" 
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Các lựa chọn (Đánh dấu vào đáp án đúng) <span style={{ color: 'red' }}>*</span></label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {form.options.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                      type="radio" 
                      name="correctOption" 
                      checked={opt.isCorrect} 
                      onChange={() => handleOptionChange(idx, 'isCorrect', true)}
                      style={{ transform: 'scale(1.5)', cursor: 'pointer' }}
                    />
                    <input 
                      type="text" 
                      className={`form-control ${opt.isCorrect ? 'border-success' : ''}`}
                      value={opt.text}
                      onChange={(e) => handleOptionChange(idx, 'text', e.target.value)}
                      placeholder={`Lựa chọn ${idx + 1}`}
                      required
                      style={opt.isCorrect ? { borderColor: 'var(--accent-success)', backgroundColor: 'var(--accent-success-light)' } : {}}
                    />
                    {form.options.length > 2 && (
                      <button 
                        type="button" 
                        className="btn btn-icon btn-ghost" 
                        onClick={() => removeOption(idx)}
                        style={{ color: 'var(--accent-danger)' }}
                      >
                        ✖
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button 
                type="button" 
                className="btn btn-ghost btn-sm" 
                onClick={addOption}
                style={{ marginTop: '10px' }}
              >
                + Thêm lựa chọn
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">Giải thích (Tùy chọn)</label>
              <textarea 
                className="form-control" 
                rows="2" 
                value={form.explanation}
                onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                placeholder="Hiển thị sau khi học viên trả lời"
              />
            </div>

            <div className="form-group" style={{ maxWidth: '150px' }}>
              <label className="form-label">Thứ tự</label>
              <input 
                type="number" 
                className="form-control" 
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                min="1"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="submit" className="btn btn-primary">Lưu câu hỏi</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Hủy</button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card">
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải...</div>
          ) : questions.length === 0 ? (
            <div className="state-container" style={{ padding: '3rem 0' }}>
              <div className="state-icon">📝</div>
              <div className="state-title">Chưa có câu hỏi nào</div>
              <p className="state-subtitle">Hãy thêm câu hỏi đầu tiên cho bài Quiz này.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Thứ tự</th>
                    <th>Nội dung câu hỏi</th>
                    <th>Số lựa chọn</th>
                    <th style={{ textAlign: 'right' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q._id}>
                      <td>{q.order}</td>
                      <td>
                        <div style={{ fontWeight: '500', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.content}
                        </div>
                      </td>
                      <td>{q.options.length}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="btn btn-icon btn-ghost" onClick={() => handleOpenForm(q)} title="Sửa">
                          ✏️
                        </button>
                        <button className="btn btn-icon btn-ghost" onClick={() => setDeleteModal({ isOpen: true, id: q._id })} title="Xóa">
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Xóa câu hỏi"
        message="Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, id: null })}
      />
    </div>
  );
};

export default QuizManager;
