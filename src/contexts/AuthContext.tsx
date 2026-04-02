'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
  role: 'client' | 'agent' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  loginWithInvite: (token: string, data: RegisterData) => Promise<boolean>;
  logout: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  idNumber: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for the prototype
const DEMO_USERS: User[] = [
  {
    id: '1',
    email: 'demo@ashuri.co.il',
    firstName: 'ישראל',
    lastName: 'ישראלי',
    phone: '052-1234567',
    idNumber: '123456789',
    role: 'client',
  },
  {
    id: '2',
    email: 'agent@ashuri.co.il',
    firstName: 'שרה',
    lastName: 'כהן',
    phone: '050-9876543',
    idNumber: '987654321',
    role: 'agent',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('ashuri_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('ashuri_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication - in production this would call an API
    const demoUser = DEMO_USERS.find(u => u.email === email);
    if (demoUser && password === 'Demo1234!') {
      setUser(demoUser);
      localStorage.setItem('ashuri_user', JSON.stringify(demoUser));
      return true;
    }
    // Allow any email with Demo1234! password for demo purposes
    if (password === 'Demo1234!' && email.includes('@')) {
      const newUser: User = {
        id: Date.now().toString(),
        email,
        firstName: 'לקוח',
        lastName: 'דמו',
        phone: '050-0000000',
        idNumber: '000000000',
        role: 'client',
      };
      setUser(newUser);
      localStorage.setItem('ashuri_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    // Demo registration
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      idNumber: data.idNumber,
      role: 'client',
    };
    setUser(newUser);
    localStorage.setItem('ashuri_user', JSON.stringify(newUser));
    return true;
  };

  const loginWithInvite = async (token: string, data: RegisterData): Promise<boolean> => {
    // Demo invite registration - token validation would be server-side in production
    if (token && token.length > 8) {
      return register(data);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ashuri_user');
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
