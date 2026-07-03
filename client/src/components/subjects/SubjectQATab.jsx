import { useState, useEffect, useCallback } from 'react';
import { getQAsBySubject, createQA, resolveQA, deleteQA } from '../../api/qaApi';
import { useToast } from '../common/Toast';

const SubjectQATab = ({ subjectId }) => {
  const [qas, setQas] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [replyContent, setReplyContent] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchQAs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getQAsBySubject(subjectId);
      setQas(res.data.data || []);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách Hỏi đáp');
    } finally {
      setLoading(false);
    }
  }, [subjectId, toast]);

  useEffect(() => {
    fetchQAs();
  }, [fetchQAs]);

  const handleReplyChange = (qaId, value) => {
    setReplyContent(prev => ({ ...prev, [qaId]: value }));
  };

  const submitReply = async (qaId, lessonId) => {
    const content = replyContent[qaId];
    if (!content || !content.trim()) return;

    try {
      await createQA(subjectId, lessonId, { content, parentQa: qaId });
      toast.success('Đã gửi câu trả lời');
      setReplyContent(prev => ({ ...prev, [qaId]: '' }));
      setReplyingTo(null);
      fetchQAs();
    } catch (err) {
      toast.error('Gửi câu trả lời thất bại');
    }
  };

  const handleResolve = async (qaId) => {
    try {
      await resolveQA(qaId);
      toast.success('Đã đánh dấu giải quyết');
      fetchQAs();
    } catch (err) {
      toast.error('Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async (qaId) => {
    if (!window.confirm('Bạn có chắc muốn ẩn câu hỏi này?')) return;
    try {
      await deleteQA(qaId);
      toast.success('Đã ẩn câu hỏi');
      fetchQAs();
    } catch (err) {
      toast.error('Lỗi khi xóa');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải Q&A...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Hỏi đáp của Học viên (Q&A)</h2>
      </div>

      {qas.length === 0 ? (
        <div className="state-container" style={{ padding: '3rem 0' }}>
          <div className="state-icon">💬</div>
          <div className="state-title">Chưa có câu hỏi nào từ học viên</div>
        </div>
      ) : (
        <div style={{ padding: '20px' }}>
          {qas.map(qa => (
            <div key={qa._id} style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px',
              backgroundColor: qa.isResolved ? '#f8f9fa' : 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                  }}>
                    {qa.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600' }}>{qa.user?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Bài học: {qa.lesson?.title} • {new Date(qa.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {qa.isResolved ? (
                    <span className="badge badge-success">Đã giải quyết</span>
                  ) : (
                    <button className="btn btn-sm btn-ghost" onClick={() => handleResolve(qa._id)} style={{ color: 'var(--accent-success)' }}>
                      ✔ Đánh dấu xong
                    </button>
                  )}
                  <button className="btn btn-sm btn-ghost" onClick={() => handleDelete(qa._id)} style={{ color: 'var(--accent-danger)' }}>
                    ✖ Ẩn
                  </button>
                </div>
              </div>

              <div style={{ padding: '10px 0', fontSize: '15px' }}>
                {qa.content}
              </div>

              {/* Danh sách câu trả lời */}
              {qa.replies && qa.replies.length > 0 && (
                <div style={{ marginLeft: '42px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {qa.replies.map(reply => (
                    <div key={reply._id} style={{ 
                      padding: '10px', 
                      backgroundColor: reply.user?.role === 'Teacher' ? 'var(--primary-light)' : '#f1f3f5',
                      borderRadius: '8px',
                      border: reply.user?.role === 'Teacher' ? '1px solid var(--primary)' : 'none'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '4px', color: reply.user?.role === 'Teacher' ? 'var(--primary-dark)' : 'inherit' }}>
                        {reply.user?.name} {reply.user?.role === 'Teacher' && '⭐ (Giảng viên)'}
                      </div>
                      <div style={{ fontSize: '14px' }}>{reply.content}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Nút Trả lời */}
              <div style={{ marginLeft: '42px', marginTop: '15px' }}>
                {replyingTo === qa._id ? (
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                    <textarea 
                      className="form-control" 
                      rows="2" 
                      placeholder="Nhập câu trả lời của bạn..."
                      value={replyContent[qa._id] || ''}
                      onChange={(e) => handleReplyChange(qa._id, e.target.value)}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => submitReply(qa._id, qa.lesson?._id)}>
                        Gửi trả lời
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setReplyingTo(null)}>
                        Hủy
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-sm btn-outline" onClick={() => setReplyingTo(qa._id)}>
                    ↩ Trả lời
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubjectQATab;
