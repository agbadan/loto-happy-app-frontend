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

// L'interface de réponse attendue de l'API pour les routes de connexion/inscription
// --- CORRIGÉ --- : Le backend renvoie 'access_token', pas 'token'
interface AuthResponse {
  access_token: string;
  token_type: string;
  // L'objet user n'est pas renvoyé par /login, mais par /me
}

// ===== FONCTIONS D'API =====

/**
 * Connecte un utilisateur en envoyant les données en format x-www-form-urlencoded.
 */
export const loginUser = async (credentials: {
  emailOrPhone: string;
  password: string;
}): Promise<{ token: string }> => { // La fonction ne retourne que le token
  
  // 1. Préparer les données pour le format form-data que le backend attend
  const formData = new URLSearchParams();
  formData.append('username', credentials.emailOrPhone); 
  formData.append('password', credentials.password);

  try {
    // 2. Faire l'appel POST en spécifiant le bon header Content-Type
    const response = await apiClient.post<AuthResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // 3. On retourne l'access_token reçu
    return { token: response.data.access_token };

  } catch (error) {
    console.error("Erreur dans authAPI.ts > loginUser:", error);
    // On propage l'erreur pour que AuthContext puisse la gérer et l'afficher
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
  return { token: response.data.access_token };
};

/**
 * Change le mot de passe de l'utilisateur connecté.
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
  // Le backend s'attend probablement à un format JSON spécifique
  const passwordData = {
    current_password: oldPassword,
    new_password: newPassword,
  };
  await apiClient.put('/api/auth/change-password', passwordData);
};

// ... (les autres fonctions comme loginWithGoogle et logoutUser restent inchangées)

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