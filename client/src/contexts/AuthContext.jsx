import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMe } from '../api/authApi';

const AuthContext = createContext(null);

// ─── DEV BYPASS: Mock admin user – remove for production ─────────────────────
const DEV_MOCK_USER = {
  _id: '000000000000000000000001',
  name: 'Dev Admin',
  email: 'admin@dev.com',
  role: 'Admin',
  isActive: true,
};
const DEV_BYPASS = false; // set to false to re-enable login
// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEV_BYPASS ? DEV_MOCK_USER : null);
  const [token, setToken] = useState(() => DEV_BYPASS ? 'dev-token' : localStorage.getItem('token'));
  const [loading, setLoading] = useState(!DEV_BYPASS);

  const fetchUser = useCallback(async () => {
    if (DEV_BYPASS) return;
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await getMe();
      setUser(res.data.data);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const loginUser = (userData, jwtToken) => {
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const hasRole = (...roles) => user && roles.includes(user.role);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, hasRole, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
