'use client';

import { createContext, ReactNode, useEffect, useState } from 'react';
import { User, AuthContextType } from '@/lib/types';
import { storage, apiPost } from '@/lib/api-client';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const savedToken = storage.getToken();
    const savedUser = storage.getUser();

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(savedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await apiPost<{ token: string; user: User }>('/api/auth/login', {
        email,
        password,
      });

      storage.setToken(response.token);
      storage.setUser(response.user);
      setToken(response.token);
      setUser(response.user);
      return response.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    userType: 'candidate' | 'recruiter',
    company?: string,
  ) => {
    setIsLoading(true);
    try {
      const response = await apiPost<{ token: string; user: User }>('/api/auth/register', {
        name,
        email,
        password,
        userType,
        company,
      });

      storage.setToken(response.token);
      storage.setUser(response.user);
      setToken(response.token);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    storage.removeToken();
    storage.removeUser();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
