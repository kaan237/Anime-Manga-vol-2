import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/backendApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('anitrack_token');
    const savedUser = localStorage.getItem('anitrack_user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Verify token is still valid
        authApi.me()
          .then(res => setUser(res.data.user))
          .catch((err) => {
            // Sadece hata konsola yazılır, kullanıcının çıkışı 401 interceptor tarafından yapılır.
            console.error('Token doğrulanırken sunucuya ulaşılamadı:', err.message);
          })
          .finally(() => setLoading(false));
      } catch {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('anitrack_token', token);
    localStorage.setItem('anitrack_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const res = await authApi.register({ username, email, password });
    const { token, user } = res.data;
    localStorage.setItem('anitrack_token', token);
    localStorage.setItem('anitrack_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('anitrack_token');
    localStorage.removeItem('anitrack_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
