import React, { useState, useEffect } from 'react';
import { getQuizQuestions } from '../../api/studentApi';
import { submitQuiz } from '../../api/progressApi';
import { useToast } from '../common/Toast';

const QuizTaking = ({ subjectId, lessonId, onQuizCompleted, currentProgress }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await getQuizQuestions(subjectId, lessonId);
        if (response.data && response.data.data) {
          setQuestions(response.data.data);
        }
        
        // If already completed in the past, maybe show their best score
        if (currentProgress && currentProgress.isCompleted && currentProgress.score !== undefined) {
          setResult({
            score: currentProgress.score,
            message: 'Bạn đã hoàn thành bài thi này trước đó.'
          });
        } else {
          setResult(null);
        }
      } catch (error) {
        toast.error('Lỗi', 'Không thể tải câu hỏi bài Quiz.');
      } finally {
        setLoading(false);
      }
    };
    
    setAnswers({});
    fetchQuestions();
  }, [subjectId, lessonId, currentProgress, toast]);

  const handleOptionChange = (questionId, optionIndex) => {
    if (result) return; // Prevent changing if already submitted
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      const confirm = window.confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`);
      if (!confirm) return;
    }

    try {
      setSubmitting(true);
      const response = await submitQuiz(subjectId, lessonId, answers);
      if (response.data && response.data.data) {
        setResult({
          score: response.data.data.score,
          correct: response.data.data.correct,
          total: response.data.data.total,
          message: 'Nộp bài thành công!'
        });
        toast.success('Thành công', 'Bài quiz đã được nộp.');
        if (onQuizCompleted) {
          onQuizCompleted(response.data.data.score);
        }
      }
    } catch (error) {
      toast.error('Lỗi', 'Không thể nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}><div className="spinner"></div></div>;
  }

  if (questions.length === 0) {
    return <div className="state-container">Bài Quiz này chưa có câu hỏi nào.</div>;
  }

  return (
    <div className="quiz-container" style={{ padding: '20px', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
      <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Bài Kiểm Tra</h2>
      
      {result && (
        <div className="alert alert-success" style={{ marginBottom: '20px', padding: '15px', backgroundColor: 'rgba(40, 167, 69, 0.1)', color: '#28a745', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>Kết quả</h3>
          <p style={{ margin: 0 }}>{result.message}</p>
          <p style={{ margin: '5px 0 0 0', fontWeight: 'bold', fontSize: '20px' }}>
            Điểm số: {result.score}/100 {result.total ? `(${result.correct}/${result.total} câu)` : ''}
          </p>
        </div>
      )}

      <div className="questions-list">
        {questions.map((q, index) => (
          <div key={q._id} className="question-card" style={{ marginBottom: '25px', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Câu {index + 1}: {q.content}</h4>
            <div className="options-list">
              {q.options && q.options.map((opt, optIndex) => (
                <div key={opt._id || optIndex} className="option-item" style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: result ? 'not-allowed' : 'pointer' }}>
                    <input 
                      type="radio" 
                      name={`question_${q._id}`} 
                      value={optIndex}
                      checked={answers[q._id] === optIndex}
                      onChange={() => handleOptionChange(q._id, optIndex)}
                      disabled={!!result}
                      style={{ marginRight: '10px' }}
                    />
                    <span>{opt.text}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!result && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSubmit} 
            disabled={submitting}
            style={{ padding: '12px 30px', fontSize: '16px' }}
          >
            {submitting ? 'Đang nộp...' : 'Nộp Bài'}
          </button>
        </div>
      )}
      
      {result && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button 
            className="btn btn-outline" 
            onClick={() => {
              setResult(null);
              setAnswers({});
            }}
          >
            Làm lại bài thi
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizTaking;
