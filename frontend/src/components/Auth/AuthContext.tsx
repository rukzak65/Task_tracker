import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

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