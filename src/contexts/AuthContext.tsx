// src/contexts/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
// On importe les fonctions renommées pour éviter les conflits de noms
import { 
  User, 
  getCurrentUser, 
  loginUser as apiLogin, 
  registerUser as apiRegister 
} from '../utils/authAPI';
// CORRECTION : Les fonctions de token viennent de leur propre fichier, pas de apiClient.
import { getToken, saveToken, removeToken } from '../utils/tokenStorage'; // Assure-toi que ce fichier existe

// Interface simplifiée : plus besoin de 'token' ou 'error' ici.
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { emailOrPhone: string; password: string }) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  // Les autres fonctions comme refreshUser et loginWithGoogle peuvent être ajoutées ici si besoin.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  // C'est le seul état de chargement dont nous avons besoin.
  const [isLoading, setIsLoading] = useState(true);

  // Ce `useEffect` s'exécute une seule fois au démarrage de l'application.
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getToken(); // On récupère le token depuis le stockage.
      if (token) {
        try {
          // CORRECTION: getCurrentUser n'a plus besoin du token en argument.
          const userData = await getCurrentUser(); 
          setUser(userData);
        } catch (error) {
          // Si le token est invalide (expiré, etc.), on le supprime.
          console.error("Échec de l'authentification avec le token existant.", error);
          removeToken();
        }
      }
      setIsLoading(false); // On a fini le chargement initial.
    };
    
    initializeAuth();
  }, []); // Le tableau de dépendances vide signifie "exécuter une seule fois".

  const login = async (credentials: { emailOrPhone: string; password: string }) => {
    setIsLoading(true);
    try {
      const { user, token } = await apiLogin(credentials);
      saveToken(token); // 1. Sauvegarder le token
      setUser(user);    // 2. Mettre à jour l'utilisateur (ce qui déclenchera la redirection)
      // IMPORTANT : On ne met PAS setIsLoading(false) ici. La redirection va démonter
      // l'écran de connexion, donc c'est inutile et peut causer des bugs.
    } catch (error) {
      // Si une erreur survient (404, 401, etc.)...
      setIsLoading(false); // ... on arrête le chargement pour que l'utilisateur puisse réessayer.
      throw error;         // ... ET ON RELANCE L'ERREUR ! C'est crucial pour que le composant puisse la traiter.
    }
  };

  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const { user, token } = await apiRegister(userData);
      saveToken(token);
      setUser(user);
    } catch (error) {
      setIsLoading(false);
      throw error; // On applique le même modèle que pour le login.
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    // Optionnel : rediriger vers la page de connexion si nécessaire.
    // window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
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