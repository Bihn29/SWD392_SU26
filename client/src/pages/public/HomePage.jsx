import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>OnlineLearn</div>
        <nav style={styles.nav}>
          <Link to="/login" style={styles.navLink}>Đăng nhập</Link>
          <Link to="/register" style={styles.btnPrimary}>Đăng ký</Link>
        </nav>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>Nền tảng học trực tuyến OnlineLearn</h1>
        <p style={styles.subtitle}>Học mọi lúc, mọi nơi với các khóa học chất lượng</p>
        <div style={styles.actions}>
          <Link to="/courses" style={styles.btnSecondary}>Xem khóa học</Link>
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#0d0f17',
    color: '#fff',
    fontFamily: 'Inter, sans-serif'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#6c63ff'
  },
  nav: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  navLink: {
    color: '#a0aabf',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s'
  },
  btnPrimary: {
    background: '#6c63ff',
    color: '#fff',
    padding: '8px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    transition: 'opacity 0.2s'
  },
  btnSecondary: {
    background: 'rgba(108, 99, 255, 0.1)',
    color: '#6c63ff',
    padding: '12px 32px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    border: '1px solid rgba(108, 99, 255, 0.2)',
    transition: 'all 0.2s'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: '0 20px'
  },
  title: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '20px',
    background: 'linear-gradient(90deg, #fff, #a0aabf)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '20px',
    color: '#a0aabf',
    marginBottom: '40px',
    maxWidth: '600px',
    lineHeight: '1.6'
  },
  actions: {
    display: 'flex',
    gap: '20px'
  }
};

export default HomePage;
