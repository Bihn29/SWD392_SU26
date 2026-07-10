import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentQuizzes } from '../../api/studentApi';
import { useToast } from '../../components/common/Toast';

const StudentQuizPage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await getStudentQuizzes();
        if (response.data && response.data.data) {
          setQuizzes(response.data.data);
        }
      } catch (error) {
        toast.error('Lỗi', 'Không thể tải danh sách bài Quiz.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [toast]);

  if (loading) {
    return <div className="state-container"><div className="spinner"></div><p>Đang tải bài Quiz...</p></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Bài tập trắc nghiệm</h1>
        <p className="page-subtitle">Danh sách các bài Quiz từ các môn bạn đã đăng ký</p>
      </div>
      
      <div style={{ padding: '20px' }}>
        {quizzes.length === 0 ? (
          <div className="state-container" style={{ marginTop: '2rem' }}>
            <div className="state-title">Chưa có bài tập nào cần làm.</div>
            <p className="state-description">Vui lòng đăng ký thêm khóa học hoặc đợi giảng viên cập nhật nội dung.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {quizzes.map((quiz, index) => (
              <div key={quiz._id || index} className="card" style={{ padding: '20px', borderLeft: quiz.isCompleted ? '4px solid #28a745' : '4px solid var(--primary-color)' }}>
                <span className={`badge ${quiz.isCompleted ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: '10px' }}>
                  {quiz.isCompleted ? 'Đã hoàn thành' : 'Chưa làm'}
                </span>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{quiz.title}</h3>
                <p style={{ margin: '0 0 15px 0', color: 'var(--text-secondary)' }}>Thuộc khóa: <strong>{quiz.subjectName}</strong></p>
                
                {quiz.isCompleted && quiz.score !== undefined && (
                  <div style={{ marginBottom: '15px', color: '#28a745', fontWeight: 'bold' }}>
                    Điểm số: {quiz.score}/100
                  </div>
                )}
                
                <div style={{ marginTop: 'auto' }}>
                  <Link to={`/student/my-courses/${quiz.subjectId}`} className={`btn ${quiz.isCompleted ? 'btn-outline' : 'btn-primary'}`}>
                    {quiz.isCompleted ? 'Làm lại' : 'Làm bài ngay'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizPage;
