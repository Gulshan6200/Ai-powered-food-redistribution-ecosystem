import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { localDataService } from '../services/localDataFallback';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('foodcycle_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('foodcycle_token');
      const storedUser = localStorage.getItem('foodcycle_user');

      if (storedToken && storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);

          // Verify with backend if available
          const res = await api.get('/auth/me');
          if (res && res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('foodcycle_user', JSON.stringify(res.user));
          }
        } catch (err) {
          // If network / offline error, preserve local user session rather than logging out
          console.info('[SmartFood AI] Operating with cached session credentials.');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res && res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('foodcycle_token', res.token);
        localStorage.setItem('foodcycle_user', JSON.stringify(res.user));
        return res.user;
      }
    } catch (err) {
      // API call failed, fall back to local service
    }

    // Direct local fallback authentication
    const localRes = localDataService.login(email, password);
    setToken(localRes.token);
    setUser(localRes.user);
    localStorage.setItem('foodcycle_token', localRes.token);
    localStorage.setItem('foodcycle_user', JSON.stringify(localRes.user));
    return localRes.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('foodcycle_token');
    localStorage.removeItem('foodcycle_user');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasRole }}>
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
