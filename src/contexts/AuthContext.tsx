'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User, UserRole } from '@/lib/types';
import { hasPermission } from '@/lib/types';
import { mockUsers } from '@/lib/mockData';

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  loginWithInvite: (token: string, data: RegisterData) => Promise<boolean>;
  logout: () => void;
  canAccess: (requiredRole: UserRole) => boolean;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PASSWORD = 'Demo1234!';

function getInitialUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('assurance_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [isLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    const demoUser = mockUsers.find(u => u.email === email);
    if (demoUser && password === DEMO_PASSWORD) {
      const updated = { ...demoUser, lastLogin: new Date().toISOString() };
      setUser(updated);
      localStorage.setItem('assurance_user', JSON.stringify(updated));
      return true;
    }
    if (password === DEMO_PASSWORD && email.includes('@')) {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        firstName: 'לקוח',
        lastName: 'חדש',
        phone: '050-0000000',
        idNumber: '000000000',
        role: 'client',
        permissions: ['view_own'],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isActive: true,
      };
      setUser(newUser);
      localStorage.setItem('assurance_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      idNumber: data.idNumber,
      role: 'client',
      permissions: ['view_own'],
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      isActive: true,
    };
    setUser(newUser);
    localStorage.setItem('assurance_user', JSON.stringify(newUser));
    return true;
  };

  const loginWithInvite = async (token: string, data: RegisterData): Promise<boolean> => {
    if (token && token.length > 8) {
      return register(data);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('assurance_user');
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
      canAccess,
      allUsers: mockUsers,
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
