import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('medquiz_token');
    if (token) {
      auth.me()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('medquiz_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await auth.login(username, password);
    const { access_token, user: userData } = res.data;
    localStorage.setItem('medquiz_token', access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('medquiz_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
