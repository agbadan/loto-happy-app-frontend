
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, getCurrentUser, loginUser as apiLogin, registerUser as apiRegister, logoutUser as apiLogout, loginWithGoogle as apiLoginWithGoogle } from '../utils/authAPI';
import { ApiError } from '../utils/apiClient';
import { getToken, saveToken, removeToken } from '../utils/apiClient';


interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: { emailOrPhone: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  loginWithGoogle: (googleToken: string, phoneNumber: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser(token);
          setUser(userData);
        } catch (e) {
          setToken(null);
          removeToken();
        }
      }
      setIsLoading(false);
    };
    initialize();
  }, [token]);

  const login = async (credentials: { emailOrPhone: string; password: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await apiLogin(credentials);
      setUser(user);
      setToken(token);
      saveToken(token);
    } catch (e) {
      const errorMessage = e instanceof ApiError ? e.message : 'Une erreur est survenue.';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await apiRegister(userData);
      setUser(user);
      setToken(token);
      saveToken(token);
    } catch (e) {
      const errorMessage = e instanceof ApiError ? e.message : 'Une erreur est survenue.';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (googleToken: string, phoneNumber: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await apiLoginWithGoogle(googleToken, phoneNumber);
      setUser(user);
      setToken(token);
      saveToken(token);
    } catch (e) {
      const errorMessage = e instanceof ApiError ? e.message : 'Une erreur est survenue.';
      setError(errorMessage);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    setToken(null);
    removeToken();
  };

  const refreshUser = async () => {
    if (token) {
        const userData = await getCurrentUser(token);
        setUser(userData);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, error, login, register, logout, refreshUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
