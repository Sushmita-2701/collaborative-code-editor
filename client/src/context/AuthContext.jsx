import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { getUserColor } from '../utils/colors';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            const enrichedUser = {
              ...res.user,
              color: getUserColor(res.user.name || res.user.email)
            };
            setUser(enrichedUser);
            localStorage.setItem('user', JSON.stringify(enrichedUser));
          }
        } catch (err) {
          console.error('[AuthContext] Session invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.success && res.token) {
      const enrichedUser = {
        ...res.user,
        color: getUserColor(res.user.name || res.user.email)
      };
      setToken(res.token);
      setUser(enrichedUser);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      return res;
    }
  };

  const register = async (name, email, password) => {
    const res = await api.auth.register({ name, email, password });
    if (res.success && res.token) {
      const enrichedUser = {
        ...res.user,
        color: getUserColor(res.user.name || res.user.email)
      };
      setToken(res.token);
      setUser(enrichedUser);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      return res;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
