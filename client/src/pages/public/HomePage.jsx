import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={styles.container}>
      {/* 1. Navbar */}
      <header style={{ ...styles.header, ...(scrolled ? styles.headerScrolled : {}) }}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🎓</span> OnlineLearn
          </div>
          <nav style={styles.navDesktop}>
            <Link to="/" style={styles.navLink}>Trang chủ</Link>
            <Link to="/courses" style={styles.navLink}>Khóa học</Link>
            <a href="#categories" style={styles.navLink}>Danh mục</a>
            <a href="#how-it-works" style={styles.navLink}>Hướng dẫn</a>
          </nav>
          <div style={styles.authGroup}>
            <Link to="/login" style={styles.loginLink}>Đăng nhập</Link>
            <Link to="/register" style={styles.btnPrimary}>Đăng ký</Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroBg}></div>
        <div style={styles.heroContent}>
          <div style={styles.badge}>Mới 🚀 Ra mắt phiên bản 2.0</div>
          <h1 style={styles.heroTitle}>
            Nền tảng học trực tuyến <br />
            <span style={styles.textGradient}>hàng đầu Việt Nam</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Học mọi lúc, mọi nơi với hơn 500+ khóa học chất lượng từ các giảng viên hàng đầu. Nâng tầm kiến thức của bạn ngay hôm nay.
          </p>
          <div style={styles.heroActions}>
            <Link to="/courses" style={styles.btnPrimaryLarge}>Khám phá khóa học</Link>
            <a href="#how-it-works" style={styles.btnOutlineLarge}>Xem demo</a>
          </div>
          <div style={styles.statsBar}>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>📚</span>
              <div>
                <div style={styles.statNumber}>500+</div>
                <div style={styles.statLabel}>Khóa học</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>👥</span>
              <div>
                <div style={styles.statNumber}>10,000+</div>
                <div style={styles.statLabel}>Học viên</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>👨‍🏫</span>
              <div>
                <div style={styles.statNumber}>50+</div>
                <div style={styles.statLabel}>Giảng viên</div>
              </div>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statIcon}>⭐</span>
              <div>
                <div style={styles.statNumber}>98%</div>
                <div style={styles.statLabel}>Hài lòng</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Courses Section */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Khóa học nổi bật</h2>
          <p style={styles.sectionSubtitle}>Được yêu thích nhất bởi học viên trong tháng qua</p>
        </div>
        <div style={styles.courseGrid}>
          {featuredCourses.map((course, idx) => (
            <div key={idx} style={styles.courseCard} className="course-card-hover">
              <div style={{ ...styles.courseImage, background: course.color }}></div>
              <div style={styles.courseContent}>
                <div style={styles.courseCategory}>{course.category}</div>
                <h3 style={styles.courseTitle}>{course.title}</h3>
                <p style={styles.courseInstructor}>Giảng viên: {course.instructor}</p>
                <div style={styles.courseFooter}>
                  <div style={styles.courseStudents}>👥 {course.students} học viên</div>
                  <Link to="/courses" style={styles.courseBtn}>Xem chi tiết</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Categories Section */}
      <section id="categories" style={{ ...styles.section, background: '#10121b' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Danh mục khóa học</h2>
          <p style={styles.sectionSubtitle}>Khám phá kiến thức theo lĩnh vực bạn quan tâm</p>
        </div>
        <div style={styles.categoryGrid}>
          {categories.map((cat, idx) => (
            <Link to="/courses" key={idx} style={styles.categoryCard} className="category-card-hover">
              <div style={styles.categoryIconWrap}>
                <span style={styles.categoryIcon}>{cat.icon}</span>
              </div>
              <h3 style={styles.categoryTitle}>{cat.name}</h3>
              <p style={styles.categoryCount}>{cat.count} khóa học</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. How It Works Section */}
      <section id="how-it-works" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Học như thế nào?</h2>
          <p style={styles.sectionSubtitle}>3 bước đơn giản để bắt đầu hành trình của bạn</p>
        </div>
        <div style={styles.stepsContainer}>
          <div style={styles.stepItem}>
            <div style={styles.stepCircle}>1</div>
            <h3 style={styles.stepTitle}>Đăng ký tài khoản</h3>
            <p style={styles.stepDesc}>Tạo tài khoản miễn phí chỉ trong 1 phút để lưu trữ tiến độ học.</p>
          </div>
          <div style={styles.stepLine}></div>
          <div style={styles.stepItem}>
            <div style={styles.stepCircle}>2</div>
            <h3 style={styles.stepTitle}>Chọn khóa học</h3>
            <p style={styles.stepDesc}>Tìm kiếm và chọn khóa học phù hợp với mục tiêu của bạn.</p>
          </div>
          <div style={styles.stepLine}></div>
          <div style={styles.stepItem}>
            <div style={styles.stepCircle}>3</div>
            <h3 style={styles.stepTitle}>Bắt đầu học</h3>
            <p style={styles.stepDesc}>Xem video bài giảng, làm bài tập và nhận chứng chỉ hoàn thành.</p>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section style={{ ...styles.section, background: '#10121b' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Học viên nói gì?</h2>
          <p style={styles.sectionSubtitle}>Cảm nhận từ những người đã trải nghiệm nền tảng</p>
        </div>
        <div style={styles.testimonialGrid}>
          {testimonials.map((t, idx) => (
            <div key={idx} style={styles.testimonialCard}>
              <div style={styles.testimonialStars}>⭐⭐⭐⭐⭐</div>
              <p style={styles.testimonialQuote}>"{t.quote}"</p>
              <div style={styles.testimonialAuthor}>
                <div style={styles.testimonialAvatar}>{t.name.charAt(0)}</div>
                <div>
                  <div style={styles.testimonialName}>{t.name}</div>
                  <div style={styles.testimonialCourse}>{t.course}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA Banner */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Sẵn sàng bắt đầu hành trình học tập?</h2>
          <p style={styles.ctaSubtitle}>Đăng ký ngay hôm nay và nhận ưu đãi 30% cho khóa học đầu tiên</p>
          <Link to="/register" style={styles.btnWhite}>Đăng ký miễn phí</Link>
        </div>
      </section>

      {/* 8. Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerGrid}>
          <div style={styles.footerCol}>
            <div style={styles.logo}>
              <span style={styles.logoIcon}>🎓</span> OnlineLearn
            </div>
            <p style={styles.footerDesc}>
              Nền tảng học trực tuyến hàng đầu, mang đến trải nghiệm học tập tốt nhất cho mọi người.
            </p>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Khóa học</h4>
            <Link to="/courses" style={styles.footerLink}>Lập trình</Link>
            <Link to="/courses" style={styles.footerLink}>Thiết kế</Link>
            <Link to="/courses" style={styles.footerLink}>Kinh doanh</Link>
            <Link to="/courses" style={styles.footerLink}>Marketing</Link>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Hỗ trợ</h4>
            <a href="#" style={styles.footerLink}>FAQ</a>
            <a href="#" style={styles.footerLink}>Liên hệ</a>
            <a href="#" style={styles.footerLink}>Chính sách</a>
            <a href="#" style={styles.footerLink}>Điều khoản</a>
          </div>
          <div style={styles.footerCol}>
            <h4 style={styles.footerTitle}>Liên hệ</h4>
            <p style={styles.footerText}>📧 contact@onlinelearn.vn</p>
            <p style={styles.footerText}>📞 1900 1234</p>
            <p style={styles.footerText}>📍 Hà Nội, Việt Nam</p>
          </div>
        </div>
        <div style={styles.footerBottom}>
          <p>© 2026 OnlineLearn. All rights reserved.</p>
        </div>
      </footer>

      {/* Inject Hover Styles */}
      <style>{`
        .course-card-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(108, 99, 255, 0.15);
          border-color: rgba(108, 99, 255, 0.4) !important;
        }
        .category-card-hover:hover {
          background: #1c2033 !important;
          border-color: rgba(108, 99, 255, 0.4) !important;
          transform: translateY(-4px);
        }
        .category-card-hover:hover span {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

// --- Mock Data ---
const featuredCourses = [
  { title: 'Fullstack Web Development với React & Node.js', category: 'Lập trình', instructor: 'Nguyễn Văn A', students: '1,200', color: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
  { title: 'UI/UX Design Masterclass: Từ số 0 đến Chuyên gia', category: 'Thiết kế', instructor: 'Trần Thị B', students: '850', color: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
  { title: 'Digital Marketing Thực chiến 2026', category: 'Marketing', instructor: 'Lê Văn C', students: '2,100', color: 'linear-gradient(135deg, #0ea5e9, #3b82f6)' },
  { title: 'Kỹ năng Giao tiếp & Thuyết trình Hiệu quả', category: 'Kỹ năng mềm', instructor: 'Phạm Thị D', students: '3,400', color: 'linear-gradient(135deg, #10b981, #059669)' }
];

const categories = [
  { name: 'Lập trình', icon: '💻', count: 120 },
  { name: 'Thiết kế', icon: '🎨', count: 85 },
  { name: 'Kinh doanh', icon: '📊', count: 64 },
  { name: 'Marketing', icon: '📱', count: 92 },
  { name: 'Ngoại ngữ', icon: '🌐', count: 150 },
  { name: 'Kỹ năng mềm', icon: '🤝', count: 45 },
];

const testimonials = [
  { name: 'Minh Tuấn', course: 'Fullstack Web Development', quote: 'Khóa học cực kỳ chi tiết. Nhờ nền tảng này tôi đã tìm được công việc Fresher sau 3 tháng học tập.' },
  { name: 'Hải Yến', course: 'UI/UX Design Masterclass', quote: 'Giảng viên hướng dẫn rất tận tình, các project thực tế giúp tôi xây dựng portfolio ấn tượng.' },
  { name: 'Quốc Bảo', course: 'Digital Marketing', quote: 'Kiến thức được cập nhật mới nhất, giao diện học tập trực quan và dễ sử dụng. Rất đáng tiền!' }
];

// --- Styles ---
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0d0f17',
    color: '#f1f5f9',
    fontFamily: 'Inter, sans-serif',
    overflowX: 'hidden'
  },
  // Navbar
  header: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '16px 0',
    transition: 'all 0.3s ease',
    background: 'transparent',
    borderBottom: '1px solid transparent'
  },
  headerScrolled: {
    background: 'rgba(13, 15, 23, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    padding: '12px 0'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    letterSpacing: '-0.5px'
  },
  logoIcon: {
    color: '#6c63ff'
  },
  navDesktop: {
    display: 'flex',
    gap: '32px',
    '@media (maxWidth: 768px)': { display: 'none' } // Simple workaround, real responsive needs CSS class
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '15px',
    transition: 'color 0.2s',
  },
  authGroup: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center'
  },
  loginLink: {
    color: '#f1f5f9',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '15px'
  },
  btnPrimary: {
    background: '#6c63ff',
    color: '#fff',
    padding: '8px 20px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.2s',
    border: 'none',
    cursor: 'pointer'
  },
  // Hero
  hero: {
    position: 'relative',
    padding: '160px 24px 80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    minHeight: '90vh',
    justifyContent: 'center'
  },
  heroBg: {
    position: 'absolute',
    top: '-20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '800px',
    height: '800px',
    background: 'radial-gradient(circle, rgba(108, 99, 255, 0.15) 0%, rgba(13, 15, 23, 0) 70%)',
    zIndex: 0,
    pointerEvents: 'none'
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  badge: {
    background: 'rgba(108, 99, 255, 0.1)',
    color: '#8b84ff',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '24px',
    border: '1px solid rgba(108, 99, 255, 0.2)'
  },
  heroTitle: {
    fontSize: 'clamp(40px, 5vw, 64px)',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '24px',
    letterSpacing: '-1px'
  },
  textGradient: {
    background: 'linear-gradient(90deg, #fff, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  heroSubtitle: {
    fontSize: 'clamp(16px, 2vw, 20px)',
    color: '#94a3b8',
    marginBottom: '40px',
    maxWidth: '600px',
    lineHeight: '1.6'
  },
  heroActions: {
    display: 'flex',
    gap: '16px',
    marginBottom: '64px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  btnPrimaryLarge: {
    background: '#6c63ff',
    color: '#fff',
    padding: '14px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    boxShadow: '0 4px 14px rgba(108, 99, 255, 0.3)'
  },
  btnOutlineLarge: {
    background: 'transparent',
    color: '#f1f5f9',
    padding: '14px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: '1px solid rgba(255,255,255,0.2)'
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 'clamp(24px, 5vw, 64px)',
    flexWrap: 'wrap',
    padding: '32px',
    background: 'rgba(19, 23, 34, 0.6)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'left'
  },
  statIcon: { fontSize: '32px' },
  statNumber: { fontSize: '24px', fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: '14px', color: '#94a3b8' },
  
  // Generic Section
  section: {
    padding: '100px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  sectionHeader: {
    textAlign: 'center',
    marginBottom: '48px'
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    marginBottom: '16px',
    color: '#fff'
  },
  sectionSubtitle: {
    fontSize: '18px',
    color: '#94a3b8',
    maxWidth: '600px',
    margin: '0 auto'
  },
  
  // Courses Grid
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },
  courseCard: {
    background: '#131722',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.05)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column'
  },
  courseImage: {
    height: '160px',
    width: '100%'
  },
  courseContent: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  courseCategory: {
    background: 'rgba(255,255,255,0.1)',
    color: '#e2e8f0',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
    alignSelf: 'flex-start',
    marginBottom: '12px'
  },
  courseTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    lineHeight: '1.4',
    color: '#f1f5f9'
  },
  courseInstructor: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '20px'
  },
  courseFooter: {
    marginTop: 'auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '16px'
  },
  courseStudents: { fontSize: '13px', color: '#94a3b8' },
  courseBtn: {
    color: '#6c63ff',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px'
  },

  // Categories
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '20px'
  },
  categoryCard: {
    background: '#131722',
    padding: '32px 20px',
    borderRadius: '12px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.05)',
    textDecoration: 'none',
    color: '#fff',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  categoryIconWrap: {
    width: '64px',
    height: '64px',
    background: 'rgba(108, 99, 255, 0.1)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  categoryIcon: {
    fontSize: '32px',
    transition: 'transform 0.2s'
  },
  categoryTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px'
  },
  categoryCount: {
    fontSize: '13px',
    color: '#94a3b8'
  },

  // Steps
  stepsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    maxWidth: '900px',
    margin: '0 auto',
    flexWrap: 'wrap'
  },
  stepItem: {
    flex: '1 1 250px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative'
  },
  stepCircle: {
    width: '64px',
    height: '64px',
    background: '#6c63ff',
    color: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
    boxShadow: '0 0 20px rgba(108, 99, 255, 0.4)'
  },
  stepTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  stepDesc: {
    color: '#94a3b8',
    lineHeight: '1.6'
  },
  stepLine: {
    flex: '0 1 100px',
    height: '2px',
    background: 'rgba(108, 99, 255, 0.3)',
    marginTop: '32px',
    '@media (maxWidth: 768px)': { display: 'none' }
  },

  // Testimonials
  testimonialGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  },
  testimonialCard: {
    background: '#131722',
    padding: '32px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.05)'
  },
  testimonialStars: { marginBottom: '16px', letterSpacing: '4px' },
  testimonialQuote: {
    fontSize: '16px',
    color: '#e2e8f0',
    lineHeight: '1.6',
    marginBottom: '24px',
    fontStyle: 'italic'
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  testimonialAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#6c63ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px'
  },
  testimonialName: { fontWeight: '600', fontSize: '15px' },
  testimonialCourse: { fontSize: '13px', color: '#94a3b8' },

  // CTA
  ctaSection: {
    padding: '80px 24px',
    display: 'flex',
    justifyContent: 'center'
  },
  ctaContent: {
    background: 'linear-gradient(135deg, #6c63ff, #4f46e5)',
    width: '100%',
    maxWidth: '1000px',
    padding: '64px 32px',
    borderRadius: '24px',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(108, 99, 255, 0.3)'
  },
  ctaTitle: {
    fontSize: 'clamp(28px, 4vw, 40px)',
    fontWeight: '800',
    color: '#fff',
    marginBottom: '16px'
  },
  ctaSubtitle: {
    fontSize: '18px',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: '32px'
  },
  btnWhite: {
    background: '#fff',
    color: '#4f46e5',
    padding: '16px 36px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '16px',
    display: 'inline-block'
  },

  // Footer
  footer: {
    background: '#0a0c12',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    padding: '80px 24px 24px'
  },
  footerGrid: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '40px',
    marginBottom: '64px'
  },
  footerCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  footerTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px'
  },
  footerDesc: {
    color: '#94a3b8',
    lineHeight: '1.6',
    fontSize: '14px'
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s'
  },
  footerText: {
    color: '#94a3b8',
    fontSize: '14px'
  },
  footerBottom: {
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px'
  }
};

export default HomePage;
