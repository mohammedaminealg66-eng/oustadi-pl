'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { apiRequest, setTokens, clearTokens, getTokens } from '@/lib/api';

interface User {
  userId: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  language?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; fullName: string; role: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getTokens().accessToken;
    if (!token) { setLoading(false); return; }

    const res = await apiRequest<{ userId: string; email: string; role: string }>('/auth/me');
    if (res.success && res.data) {
      setUser(res.data as User);
    } else {
      clearTokens();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const res = await apiRequest<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });

    if (!res.success || !res.data) return { success: false, error: res.error };

    const { accessToken, refreshToken } = res.data as any;
    setTokens(accessToken, refreshToken);
    await fetchUser();
    return { success: true };
  };

  const register = async (data: { email: string; password: string; fullName: string; role: string }) => {
    const res = await apiRequest<{ accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });

    if (!res.success || !res.data) return { success: false, error: res.error };

    const { accessToken, refreshToken } = res.data as any;
    setTokens(accessToken, refreshToken);
    await fetchUser();
    return { success: true };
  };

  const logout = async () => {
    const { refreshToken } = getTokens();
    if (refreshToken) {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    }
    clearTokens();
    setUser(null);
  };

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
