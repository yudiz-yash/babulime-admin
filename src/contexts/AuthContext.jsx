import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('bl_admin_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('bl_admin_token');
    if (token) {
      api.get('/auth/me')
        .then(res => { setAdmin(res.data); localStorage.setItem('bl_admin_user', JSON.stringify(res.data)); })
        .catch(() => { localStorage.removeItem('bl_admin_token'); localStorage.removeItem('bl_admin_user'); setAdmin(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('bl_admin_token', res.data.token);
    localStorage.setItem('bl_admin_user', JSON.stringify(res.data.admin));
    setAdmin(res.data.admin);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('bl_admin_token');
    localStorage.removeItem('bl_admin_user');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
