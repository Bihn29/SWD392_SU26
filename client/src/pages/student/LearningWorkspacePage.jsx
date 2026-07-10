import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseLessons } from '../../api/studentApi';
import { getPublicSubjectById } from '../../api/subjectApi';
import { getStudentProgress, markLessonComplete } from '../../api/progressApi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/common/Toast';
import QuizTaking from '../../components/student/QuizTaking';
import LessonQA from '../../components/student/LessonQA';

const LearningWorkspacePage = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progresses, setProgresses] = useState([]);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Load course details
        const courseRes = await getPublicSubjectById(courseId);
        if (courseRes.data && courseRes.data.data) {
          setCourse(courseRes.data.data);
        }

        // Load lessons
        const lessonsRes = await getCourseLessons(courseId);
        if (lessonsRes.data && lessonsRes.data.data) {
          const loadedLessons = lessonsRes.data.data;
          setLessons(loadedLessons);
          if (loadedLessons.length > 0) {
            setActiveLesson(loadedLessons[0]);
          }
        }

        // Load progress
        const progressRes = await getStudentProgress(courseId);
        if (progressRes.data && progressRes.data.data) {
          setProgresses(progressRes.data.data);
        }
      } catch (error) {
        toast.error('Lỗi', 'Không thể tải phòng học. Có thể bạn chưa đăng ký hoặc khóa học không tồn tại.');
        navigate('/student/my-courses');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, navigate, toast]);

  const handleSelectLesson = (lesson) => {
    setActiveLesson(lesson);
  };

  const getLessonProgress = (lessonId) => {
    return progresses.find(p => p.lesson === lessonId);
  };

  const handleMarkComplete = async () => {
    if (!activeLesson) return;
    try {
      const response = await markLessonComplete(courseId, activeLesson._id);
      if (response.data && response.data.data) {
        // Update local progress list
        const updatedProgress = response.data.data;
        setProgresses(prev => {
          const idx = prev.findIndex(p => p.lesson === activeLesson._id);
          if (idx !== -1) {
            const newList = [...prev];
            newList[idx] = updatedProgress;
            return newList;
          }
          return [...prev, updatedProgress];
        });
        toast.success('Thành công', 'Đã đánh dấu hoàn thành bài học!');
      }
    } catch (error) {
      toast.error('Lỗi', 'Không thể đánh dấu hoàn thành.');
    }
  };

  const handleQuizCompleted = (score) => {
    // The quiz component handles submission, we just need to update local progress state
    setProgresses(prev => {
      const idx = prev.findIndex(p => p.lesson === activeLesson._id);
      const newProgress = { lesson: activeLesson._id, isCompleted: true, score };
      if (idx !== -1) {
        const newList = [...prev];
        // Only update score if it's higher or wasn't set
        if (newList[idx].score === undefined || score >= newList[idx].score) {
           newList[idx] = { ...newList[idx], isCompleted: true, score };
        } else {
           newList[idx].isCompleted = true;
        }
        return newList;
      }
      return [...prev, newProgress];
    });
  };

  const calculateTotalProgress = () => {
    if (lessons.length === 0) return 0;
    const completedCount = progresses.filter(p => p.isCompleted).length;
    return Math.round((completedCount / lessons.length) * 100);
  };

  if (loading) {
    return <div className="state-container" style={{ minHeight: '100vh' }}><div className="spinner"></div><p>Đang chuẩn bị lớp học...</p></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#0d0f17' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '15px 20px', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 10 }}>
        <button className="btn btn-ghost" onClick={() => navigate('/student/my-courses')} style={{ marginRight: '15px' }}>
          ← Thoát
        </button>
        <h1 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {course?.name || 'Khóa học'}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Tiến độ ({calculateTotalProgress()}%)</span>
            <div style={{ width: '150px', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
              <div style={{ width: `${calculateTotalProgress()}%`, height: '100%', backgroundColor: 'var(--primary-color)', transition: 'width 0.3s' }}></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Left/Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', backgroundColor: '#0a0c13' }}>
          {!activeLesson ? (
            <div className="state-container" style={{ flex: 1 }}>
              <h2>Chào mừng bạn đến với khóa học!</h2>
              <p>Hãy chọn một bài học ở danh sách bên phải để bắt đầu.</p>
            </div>
          ) : (
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '20px' }}>
              {/* Content Player Area */}
              <div style={{ backgroundColor: 'var(--surface-color)', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
                {activeLesson.type === 'Video' && (
                  <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeLesson.contentUrl && activeLesson.contentUrl.includes('youtube.com') ? (
                      <iframe 
                        width="100%" 
                        height="100%" 
                        src={activeLesson.contentUrl.replace('watch?v=', 'embed/')} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <video width="100%" height="100%" controls controlsList="nodownload">
                        <source src={activeLesson.contentUrl} type="video/mp4" />
                        Trình duyệt của bạn không hỗ trợ thẻ video.
                      </video>
                    )}
                  </div>
                )}
                
                {activeLesson.type === 'Document' && (
                  <div style={{ padding: '30px', minHeight: '400px', backgroundColor: 'var(--surface-color)' }}>
                    <h2 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>{activeLesson.title}</h2>
                    <div className="rich-text-content" style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }} dangerouslySetInnerHTML={{ __html: activeLesson.content }} />
                  </div>
                )}

                {activeLesson.type === 'Quiz' && (
                  <QuizTaking 
                    subjectId={courseId} 
                    lessonId={activeLesson._id} 
                    onQuizCompleted={handleQuizCompleted}
                    currentProgress={getLessonProgress(activeLesson._id)}
                  />
                )}
              </div>

              {/* Lesson Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <h2 style={{ margin: '0 0 5px 0', fontSize: '20px' }}>{activeLesson.title}</h2>
                  <span className="badge badge-info">{activeLesson.type}</span>
                </div>
                <div>
                  {activeLesson.type !== 'Quiz' && (
                    <button 
                      className={`btn ${getLessonProgress(activeLesson._id)?.isCompleted ? 'btn-success' : 'btn-primary'}`}
                      onClick={handleMarkComplete}
                      disabled={getLessonProgress(activeLesson._id)?.isCompleted}
                    >
                      {getLessonProgress(activeLesson._id)?.isCompleted ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                    </button>
                  )}
                </div>
              </div>

              {/* Q&A Section */}
              <LessonQA subjectId={courseId} lessonId={activeLesson._id} />

            </div>
          )}
        </div>

        {/* Right Sidebar: Lesson List */}
        <div style={{ width: '320px', backgroundColor: 'var(--surface-color)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid var(--border-color)' }}>
            <h3 style={{ margin: 0, fontSize: '16px' }}>Nội dung khóa học</h3>
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {lessons.map((lesson, index) => {
              const isCompleted = getLessonProgress(lesson._id)?.isCompleted;
              const isActive = activeLesson?._id === lesson._id;
              
              let icon = '📄';
              if (lesson.type === 'Video') icon = '▶️';
              if (lesson.type === 'Quiz') icon = '✍️';

              return (
                <div 
                  key={lesson._id}
                  onClick={() => handleSelectLesson(lesson)}
                  style={{ 
                    padding: '15px', 
                    borderBottom: '1px solid var(--border-color)', 
                    cursor: 'pointer',
                    backgroundColor: isActive ? 'rgba(108, 99, 255, 0.1)' : 'transparent',
                    borderLeft: isActive ? '4px solid var(--primary-color)' : '4px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                  className="lesson-list-item"
                >
                  <div style={{ fontSize: '18px' }}>
                    {isCompleted ? <span style={{ color: '#28a745' }}>✅</span> : <span>{icon}</span>}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>Bài {index + 1}</div>
                    <div style={{ fontSize: '14px', color: isActive ? 'var(--primary-color)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isActive ? '600' : 'normal' }}>
                      {lesson.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningWorkspacePage;
