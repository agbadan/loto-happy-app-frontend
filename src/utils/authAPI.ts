// src/utils/authAPI.ts

import apiClient from '../services/apiClient_';

// ===== INTERFACES =====
// Nous gardons ton interface User qui est bien détaillée.
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

// L'interface de réponse attendue de l'API pour les routes de connexion/inscription
interface AuthResponse {
  user: User;
  token: string;
}

// ===== FONCTIONS D'API =====

/**
 * Connecte un utilisateur.
 * CORRECTION MAJEURE : Cette fonction fait maintenant UN SEUL appel API.
 * Le backend, lors d'une connexion réussie, doit renvoyer à la fois le token et les données de l'utilisateur.
 * Cela rend le processus plus rapide et la gestion des erreurs (404, 401) beaucoup plus simple.
 */
// DANS src/utils/authAPI.ts

export const loginUser = async (credentials: {
  emailOrPhone: string;
  password: string;
}): Promise<{ user: User; token: string }> => {
  const formData = new URLSearchParams();
  formData.append('username', credentials.emailOrPhone); 
  formData.append('password', credentials.password);

  // UN SEUL APPEL qui retourne maintenant tout ce dont on a besoin.
  const response = await apiClient.post('/api/auth/login', formData);
  
  // On retourne directement les données reçues, qui contiennent maintenant 'user' et 'token'.
  return response.data;
};


/**
 * Récupère les informations de l'utilisateur authentifié.
 * CORRECTION : Le token n'est plus passé en argument.
 * Notre apiClient est configuré avec un intercepteur qui ajoute AUTOMATIQUEMENT le token
 * depuis le localStorage à chaque requête. C'est plus propre et plus sûr.
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/api/auth/me');
  return response.data;
};


/**
 * Inscrit un nouveau joueur.
 */
export const registerUser = async (userData: any): Promise<AuthResponse> => {
  // L'endpoint /register attend du JSON.
  // Nous supposons que cet endpoint renvoie aussi l'utilisateur et un token, comme le login.
  const response = await apiClient.post<AuthResponse>('/api/auth/register', userData);
  return response.data;
};


/**
 * Change le mot de passe de l'utilisateur connecté.
 */
export const changePassword = async (passwordData: { current_password: string; new_password: string }): Promise<void> => {
  await apiClient.put('/api/auth/change-password', passwordData);
};


// ----- Fonctions non utilisées dans le flux principal pour l'instant -----

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