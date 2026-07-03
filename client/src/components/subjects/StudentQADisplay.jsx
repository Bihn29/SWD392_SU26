import { useState, useEffect, useCallback } from 'react';
import { getQAsByLesson, createQA } from '../../api/qaApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';

const StudentQADisplay = ({ subjectId, lessonId }) => {
  const [qas, setQas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyContent, setReplyContent] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);
  
  const { user } = useAuth();
  const toast = useToast();

  const fetchQAs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQAsByLesson(lessonId);
      setQas(res.data.data || []);
    } catch (err) {
      toast.error('Không thể tải Hỏi đáp');
    } finally {
      setLoading(false);
    }
  }, [lessonId, toast]);

  useEffect(() => {
    if (lessonId) fetchQAs();
  }, [lessonId, fetchQAs]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    try {
      await createQA(subjectId, lessonId, { content: newQuestion });
      toast.success('Đã gửi câu hỏi');
      setNewQuestion('');
      fetchQAs();
    } catch (err) {
      toast.error('Gửi thất bại');
    }
  };

  const submitReply = async (qaId) => {
    const content = replyContent[qaId];
    if (!content || !content.trim()) return;

    try {
      await createQA(subjectId, lessonId, { content, parentQa: qaId });
      toast.success('Đã gửi bình luận');
      setReplyContent(prev => ({ ...prev, [qaId]: '' }));
      setReplyingTo(null);
      fetchQAs();
    } catch (err) {
      toast.error('Gửi thất bại');
    }
  };

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải bình luận...</div>;

  return (
    <div className="student-qa-section" style={{ marginTop: '30px', padding: '20px', backgroundColor: 'var(--card-bg)', borderRadius: '12px' }}>
      <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
        Hỏi đáp ({qas.length})
      </h3>

      {/* Form đặt câu hỏi */}
      <form onSubmit={handleAskQuestion} style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Bạn có thắc mắc gì về bài học này?"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <div style={{ textAlign: 'right' }}>
          <button type="submit" className="btn btn-primary">Gửi câu hỏi</button>
        </div>
      </form>

      {/* Danh sách Q&A */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {qas.map(qa => (
          <div key={qa._id} style={{ padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {qa.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {qa.user?.name}
                  {qa.user?.role === 'Teacher' && <span className="badge badge-primary" style={{ fontSize: '10px' }}>Giảng viên</span>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(qa.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

            <p style={{ margin: '10px 0', fontSize: '15px', lineHeight: '1.5' }}>{qa.content}</p>

            {/* Trả lời (Replies) */}
            {qa.replies && qa.replies.length > 0 && (
              <div style={{ marginLeft: '50px', marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {qa.replies.map(reply => (
                  <div key={reply._id} style={{ padding: '10px', backgroundColor: reply.user?.role === 'Teacher' ? 'var(--primary-light)' : '#f8f9fa', borderRadius: '8px', borderLeft: reply.user?.role === 'Teacher' ? '3px solid var(--primary)' : '3px solid #ccc' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', display: 'flex', gap: '5px' }}>
                      {reply.user?.name}
                      {reply.user?.role === 'Teacher' && <span style={{ color: 'var(--primary)' }}>⭐</span>}
                    </div>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Nút reply */}
            <div style={{ marginLeft: '50px', marginTop: '10px' }}>
              {replyingTo === qa._id ? (
                <div style={{ marginTop: '10px' }}>
                  <textarea 
                    className="form-control" 
                    rows="2" 
                    placeholder="Viết bình luận..."
                    value={replyContent[qa._id] || ''}
                    onChange={(e) => setReplyContent({ ...replyContent, [qa._id]: e.target.value })}
                  />
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm btn-primary" onClick={() => submitReply(qa._id)}>Gửi</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setReplyingTo(null)}>Hủy</button>
                  </div>
                </div>
              ) : (
                <button className="btn btn-sm btn-ghost" onClick={() => setReplyingTo(qa._id)}>
                  Trả lời
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentQADisplay;
