import React, { useState, useEffect } from 'react';
import { getQAsByLesson, createQA } from '../../api/qaApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';

const LessonQA = ({ subjectId, lessonId }) => {
  const [qas, setQas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    const fetchQAs = async () => {
      try {
        setLoading(true);
        const response = await getQAsByLesson(lessonId);
        if (response.data && response.data.data) {
          setQas(response.data.data);
        }
      } catch (error) {
        console.error('Lỗi tải Hỏi Đáp', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (lessonId) {
      fetchQAs();
    }
  }, [lessonId]);

  const handleSubmitQA = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      setSubmitting(true);
      const payload = { content: newQuestion };
      const response = await createQA(subjectId, lessonId, payload);
      
      if (response.data && response.data.data) {
        // Optimistically add to list
        const newQa = {
          _id: response.data.data._id || Date.now().toString(),
          content: newQuestion,
          user: { _id: user._id, name: user.name || user.fullName },
          createdAt: new Date().toISOString(),
          isResolved: false
        };
        setQas([newQa, ...qas]);
        setNewQuestion('');
        toast.success('Thành công', 'Đã gửi câu hỏi.');
      }
    } catch (error) {
      toast.error('Lỗi', 'Không thể gửi câu hỏi.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Đang tải hỏi đáp...</div>;
  }

  return (
    <div className="qa-section" style={{ marginTop: '40px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
      <h3 style={{ marginBottom: '20px' }}>Hỏi & Đáp ({qas.length})</h3>
      
      <form onSubmit={handleSubmitQA} style={{ marginBottom: '30px', display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Bạn có câu hỏi gì về bài học này?" 
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          style={{ flex: 1 }}
          disabled={submitting}
        />
        <button type="submit" className="btn btn-primary" disabled={submitting || !newQuestion.trim()}>
          Gửi
        </button>
      </form>

      <div className="qa-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {qas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!</p>
        ) : (
          qas.map((qa) => (
            <div key={qa._id} className="qa-item" style={{ backgroundColor: 'var(--surface-color)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ color: 'var(--text-primary)' }}>{qa.user?.name || 'Học viên'}</strong>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(qa.createdAt).toLocaleDateString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p style={{ margin: '0 0 10px 0', lineHeight: '1.5', color: 'var(--text-secondary)' }}>{qa.content}</p>
              
              {qa.isResolved && (
                <span className="badge badge-success" style={{ fontSize: '11px' }}>Đã giải quyết</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LessonQA;
