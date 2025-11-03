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

// L'interface de réponse correspond à ce que le backend renvoie VRAIMENT
interface AuthResponse {
  user: User;
  token: string;
}

// ===== FONCTIONS D'API =====

/**
 * Connecte un utilisateur en envoyant les données en JSON.
 * En cas de succès, retourne l'objet { user, token }.
 */
export const loginUser = async (credentials: {
  emailOrPhone: string;
  password: string;
}): Promise<AuthResponse> => {
  
  // 1. Préparer le corps de la requête en format JSON.
  // Le backend attend un champ `username`, donc on mappe `emailOrPhone` dessus.
  const payload = {
    username: credentials.emailOrPhone,
    password: credentials.password,
  };
  
  try {
    // 2. Faire l'appel POST. Axios utilise 'application/json' par défaut.
    // La réponse attendue est de type AuthResponse.
    const response = await apiClient.post<AuthResponse>('/api/auth/login', payload);
    
    // 3. On retourne l'objet complet { user, token }
    return response.data;
  } catch (error) {
    console.error("Erreur dans authAPI.ts > loginUser:", error);
    // On propage l'erreur pour que le AuthContext puisse la gérer
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
export const registerUser = async (userData: any): Promise<{ user: User; token: string }> => {
  // L'inscription attend du JSON et renvoie l'utilisateur et un token pour une connexion immédiate.
  const response = await apiClient.post<{ user: User; token: string }>('/api/auth/register', userData);
  return response.data; // Retourne { token, user }
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
 * La déconnexion est gérée côté client en supprimant le token, pas besoin d'appel API.
 */
export const logoutUser = () => {
  console.log("Déconnexion de l'utilisateur (opération côté client).");
};


/**
 * Gère la connexion ou la pré-inscription via Google.
 */
export const loginWithGoogleAPI = async (email: string, name: string): Promise<any> => {
  const response = await apiClient.post('/api/auth/google/login', { email, name });
  return response.data;
};

/**
 * Finalise l'inscription d'un utilisateur Google avec les informations supplémentaires.
 */
export const completeGoogleRegistrationAPI = async (userData: {
  email: string;
  name: string;
  username: string;
  phoneNumber: string;
}): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/api/auth/google/register', userData);
  return response.data;
};