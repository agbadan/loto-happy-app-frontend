// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// --- L'IMPORT CORRECT ---
import apiClient from '../services/apiClient';
import { loginUser as apiLogin, registerUser as apiRegister } from '../utils/authAPI';
// On importe depuis un fichier dédié pour plus de propreté
import { getToken, saveToken, removeToken } from '../utils/tokenStorage';

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
      console.error("Échec de la récupération de l'utilisateur.", error);
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
    // Ne pas mettre isLoading ici pour une meilleure expérience utilisateur
    try {
      const { token } = await apiLogin(credentials);
      saveToken(token);
      // L'intercepteur dans apiClient s'occupe de mettre le header, pas besoin de le faire ici.
      await fetchUser();
    } catch (error) {
      // Si une erreur se produit, on la propage pour que le formulaire de login puisse l'afficher
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const { token } = await apiRegister(userData);
      saveToken(token);
      await fetchUser();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    // L'intercepteur verra qu'il n'y a plus de token, pas besoin de supprimer le header manuellement.
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