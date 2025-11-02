// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import apiClient from '../services/apiClient_';
import { 
  loginUser as apiLogin, 
  registerUser as apiRegister 
} from '../utils/authAPI';
import { getToken, saveToken, removeToken } from '../utils/tokenStorage';

// Définition du type User complet, aligné avec la réponse de /api/auth/me
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
  refreshUser: () => Promise<void>; // Fonction pour rafraîchir les soldes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction centrale pour récupérer les données de l'utilisateur
  const fetchUser = async () => {
    try {
      const response = await apiClient.get<User>('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error("Échec de la récupération de l'utilisateur.", error);
      // Si le token est invalide, on déconnecte
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
    setIsLoading(true);
    try {
      // L'ancienne fonction `apiLogin` retournait user+token, nous n'avons besoin que du token ici.
      const response = await apiLogin(credentials);
      saveToken(response.token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      await fetchUser(); // On récupère l'utilisateur complet juste après avoir sauvegardé le token
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const { token } = await apiRegister(userData);
      saveToken(token);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await fetchUser();
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    delete apiClient.defaults.headers.common['Authorization'];
  };

  // Fonction pour permettre aux autres composants de rafraîchir les données utilisateur (ex: après un pari)
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