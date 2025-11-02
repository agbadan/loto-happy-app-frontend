// src/utils/authAPI.ts

import apiClient from '../services/apiClient';

// ===== INTERFACES =====
export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  email: string;
  role: 'player' | 'reseller' | 'Super Admin' | 'Admin du Jeu' | 'Support Client' | 'Admin Financier';
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance?: number;
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string | null;
}

interface AuthResponse {
  token: string;
  user: User; // Le backend renvoie aussi l'objet utilisateur
}

// ===== FONCTIONS D'API =====

/**
 * Connecte un utilisateur en envoyant les données en format JSON.
 * C'est la méthode finale et la plus robuste.
 */
export const loginUser = async (credentials: {
  emailOrPhone: string;
  password: string;
}): Promise<{ token: string }> => {
  
  // 1. Préparer le corps de la requête en JSON
  const loginData = {
    username: credentials.emailOrPhone,
    password: credentials.password,
  };

  try {
    // 2. Faire l'appel POST. Axios envoie du JSON par défaut, pas besoin de config spéciale.
    const response = await apiClient.post<AuthResponse>('/api/auth/login', loginData);
    
    // 3. On retourne le token reçu
    return { token: response.data.token };

  } catch (error) {
    console.error("Erreur dans authAPI.ts > loginUser:", error);
    // On propage l'erreur pour que le formulaire de login puisse afficher le message d'erreur
    throw error;
  }
};

/**
 * Récupère les informations de l'utilisateur authentifié.
 * L'apiClient ajoute automatiquement le token.
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/auth/me');
  return response.data;
};

/**
 * Inscrit un nouveau joueur.
 * (Suppose que l'inscription attend du JSON, ce qui est courant).
 */
export const registerUser = async (userData: any): Promise<{ token: string }> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
  return { token: response.data.token };
};

/**
 * Change le mot de passe de l'utilisateur connecté.
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  const passwordData = {
    current_password: oldPassword,
    new_password: newPassword,
  };
  await apiClient.put('/api/auth/change-password', passwordData);
};

/**
 * Gère la connexion via Google (Placeholder).
 */
export const loginWithGoogle = async (googleToken: string, name: string): Promise<any> => {
  console.warn("La fonctionnalité de connexion Google n'est pas encore implémentée côté backend.");
  throw new Error("Connexion Google non disponible.");
};

/**
 * La déconnexion est gérée côté client en supprimant le token, pas besoin d'appel API.
 */
export const logoutUser = () => {
  console.log("Déconnexion de l'utilisateur (opération côté client).");
};