// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// L'import du VRAI client API
import apiClient from '../services/apiClient'; 
import { loginUser as apiLogin, registerUser as apiRegister , loginWithGoogleAPI} from '../utils/authAPI';
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
  loginWithGoogle: (email: string, name: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

    // NOUVELLE FONCTION à ajouter dans le provider
  const loginWithGoogle = async (email: string, name: string) => {
    try {
      const response = await loginWithGoogleAPI(email, name);
      if (response.isNewUser) {
        // C'est un nouvel utilisateur, on ne le connecte pas encore.
        // On renvoie les infos à l'écran de connexion pour qu'il redirige.
        return { isNewUser: true, email: response.email, name: response.name };
      } else {
        // C'est un utilisateur existant, on le connecte.
        saveToken(response.token);
        setUser(response.user);
        return { isNewUser: false, user: response.user };
      }
    } catch (error) {
      console.error("Erreur lors de la connexion Google:", error);
      throw error;
    }
  };

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
      const { token, user } = await apiLogin(credentials);
      saveToken(token);
      setUser(user);
    } catch (error) {
      // Pas besoin de supprimer le header manuellement, l'intercepteur gère tout.
      throw error;
    }
  };

  const register = async (userData: any) => {
    try {
      const { token, user } = await apiRegister(userData);
      saveToken(token);
      setUser(user);
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
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, refreshUser , loginWithGoogle}}>
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