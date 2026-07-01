import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSubjects } from '../../api/subjectApi';
import { useToast } from '../../components/common/Toast';
import StatusBadge from '../../components/common/StatusBadge'; // We can use badges if we want to show category, not status

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const toast = useToast();

  const fetchCourses = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getPublicSubjects({
        page,
        limit: 12,
        search,
        category
      });
      if (response.data && response.data.data) {
        setCourses(response.data.data.items || []);
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      }
    } catch (error) {
      toast.error('Lỗi', 'Không thể tải danh sách khóa học.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [category]); // Re-fetch on category change

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCourses(1);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div className="page-header" style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Khám phá Khóa học</h1>
        <p className="page-subtitle" style={{ fontSize: '1.1rem' }}>Tìm kiếm và đăng ký các khóa học tốt nhất dành cho bạn.</p>
      </div>

      <div className="card" style={{ marginBottom: '30px', padding: '20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Nhập tên khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: '200px' }}>
            <select
              className="form-control"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              <option value="Programming">Lập trình</option>
              <option value="Design">Thiết kế</option>
              <option value="Business">Kinh doanh</option>
              <option value="Marketing">Marketing</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Đang tìm...' : '🔍 Tìm kiếm'}
          </button>
        </form>
      </div>

      {loading && courses.length === 0 ? (
        <div className="state-container" style={{ padding: '4rem 0' }}>
          <div className="spinner"></div>
          <p>Đang tải khóa học...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="state-container" style={{ padding: '4rem 0' }}>
          <div className="state-title">Không tìm thấy khóa học nào</div>
          <p className="state-description">Vui lòng thử nghiệm từ khóa hoặc danh mục khác.</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px', marginBottom: '40px' }}>
            {courses.map(course => (
              <div key={course._id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ height: '160px', backgroundColor: 'var(--surface-color)', backgroundImage: course.thumbnail ? `url(${course.thumbnail})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: '1px solid var(--border-color)' }}>
                  {!course.thumbnail && <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No Image</div>}
                </div>
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <span className="badge badge-info">{course.category || 'Chung'}</span>
                  </div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', color: 'var(--text-primary)', lineHeight: '1.4' }}>{course.name}</h3>
                  <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Giảng viên: {course.owner?.name || '—'}</p>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                    <span>👥 {course.studentCount || 0} học viên</span>
                  </div>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <Link to={`/courses/${course._id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                className="btn btn-ghost"
                disabled={pagination.page <= 1}
                onClick={() => fetchCourses(pagination.page - 1)}
              >
                Trang trước
              </button>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 15px', backgroundColor: 'var(--surface-color)', borderRadius: '6px' }}>
                {pagination.page} / {pagination.totalPages}
              </div>
              <button
                className="btn btn-ghost"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchCourses(pagination.page + 1)}
              >
                Trang tiếp
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CoursesPage;
