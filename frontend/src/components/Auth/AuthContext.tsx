import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import AuthService from '../../services/auth';
import { AuthContext } from './AuthContextInstance';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const auth = AuthService.isAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        setUserId(AuthService.getUserId());
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    await AuthService.login({ email, password });
    setIsAuthenticated(true);
    setUserId(AuthService.getUserId());
  };

  const register = async (name: string, email: string, password: string) => {
    await AuthService.register({ name, email, password });
    setIsAuthenticated(true);
    setUserId(AuthService.getUserId());
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userId, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};