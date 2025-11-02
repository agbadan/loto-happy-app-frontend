// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// L'import du VRAI client API
import apiClient from '../services/apiClient'; 
import { loginUser as apiLogin, registerUser as apiRegister } from '../utils/authAPI';
import { getToken, saveToken, removeToken } from '../utils/tokenStorage'; // Supposons que ce fichier existe

export interface User {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: 'player' | 'admin' | 'reseller';
  status: string;
  createdAt: string;
  lastLogin: string;
  balanceGame: number;
  balanceWinnings: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { emailOrPhone: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get<User>('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error("Échec de la récupération de l'utilisateur (fetchUser).", error);
      // En cas d'échec (token invalide), on nettoie tout
      setUser(null);
      removeToken();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken();
      if (token) {
        await fetchUser();
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (credentials: { emailOrPhone: string; password: string }) => {
    try {
      const { token } = await apiLogin(credentials);
      saveToken(token);

      // --- LA CORRECTION CRUCIALE EST ICI ---
      // On met à jour manuellement le header par défaut d'axios pour les requêtes futures de cette session.
      // L'intercepteur utilisera ce header mis à jour.
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Maintenant, on peut appeler fetchUser en étant certain que le bon token sera utilisé.
      await fetchUser();
    } catch (error) {
      // Nettoyage en cas d'échec du login
      delete apiClient.defaults.headers.common['Authorization'];
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const { token } = await apiRegister(userData);
      saveToken(token);
      // On fait la même chose pour l'inscription
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await fetchUser();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    // On nettoie le header par défaut lors de la déconnexion
    delete apiClient.defaults.headers.common['Authorization'];
  };
  
  const refreshUser = async () => {
      if(getToken()) {
          await fetchUser();
      }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser }}>
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