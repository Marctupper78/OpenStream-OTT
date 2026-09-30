import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const TOKEN_KEY = 'orbita_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const applyToken = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/auth', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { localStorage.removeItem(TOKEN_KEY); return; }
      const { user } = await res.json();
      setUser(user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      applyToken(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [applyToken]);

  const login = async (email: string, password: string): Promise<string | null> => {
    const res = await fetch('/api/auth?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || 'Erro ao fazer login';
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return null;
  };

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    const res = await fetch('/api/auth?action=register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) return data.error || 'Erro ao criar conta';
    localStorage.setItem(TOKEN_KEY, data.token);
    setUser(data.user);
    return null;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
