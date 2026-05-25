'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { hasPermission } from '@/lib/types';

export type { User };

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  loginWithInvite: (token: string, data: RegisterData) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  canAccess: (requiredRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function jsonRequest<T>(url: string, init: RequestInit = {}): Promise<{ ok: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
      ...init,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: body?.error ?? `HTTP ${res.status}` };
    return { ok: true, data: body as T };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    const res = await jsonRequest<{ user: User | null }>('/api/auth/me', { method: 'GET' });
    setUser(res.ok && res.data?.user ? (res.data.user as User) : null);
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { credentials: 'include' })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        const body = (await res.json().catch(() => ({}))) as { user?: User | null };
        setUser(body.user ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await jsonRequest<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.ok && res.data?.user) {
      setUser(res.data.user);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  };

  const register = async (data: RegisterData) => {
    const res = await jsonRequest<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok && res.data?.user) {
      setUser(res.data.user);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  };

  const loginWithInvite = async (token: string, data: RegisterData) => {
    const res = await jsonRequest<{ user: User }>('/api/auth/invite', {
      method: 'PUT',
      body: JSON.stringify({ token, ...data }),
    });
    if (res.ok && res.data?.user) {
      setUser(res.data.user);
      return { ok: true };
    }
    return { ok: false, error: res.error };
  };

  const logout = async () => {
    await jsonRequest('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const canAccess = (requiredRole: UserRole): boolean => {
    if (!user) return false;
    return hasPermission(user.role, requiredRole);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      loginWithInvite,
      logout,
      refresh,
      canAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
