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
  access_token: string;
  token_type: 'bearer';
}

// ===== FONCTIONS D'API =====

/**
 * Connecte un utilisateur. Le backend attend du `x-www-form-urlencoded`.
 * En cas de succès, retourne uniquement le `access_token`.
 */
export const loginUser = async (credentials: {
  emailOrPhone: string;
  password: string;
}): Promise<string> => {
  
  // 1. Préparer le corps de la requête en format `x-www-form-urlencoded`
  const formData = new URLSearchParams();
  formData.append('username', credentials.emailOrPhone);
  formData.append('password', credentials.password);
  
  try {
    // 2. Faire l'appel POST. Il est CRUCIAL de passer l'objet formData directement
    // et de spécifier le header 'Content-Type' pour qu'Axios envoie les données
    // en format x-www-form-urlencoded et non en JSON.
    const response = await apiClient.post<AuthResponse>('/api/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    // 3. On retourne uniquement le `access_token`
    return response.data.access_token;
  } catch (error) {
    console.error("Erreur dans authAPI.ts > loginUser:", error);
    // On propage l'erreur pour que le composant de login puisse la gérer
    // (par exemple, pour afficher "Mot de passe incorrect" ou "Utilisateur non trouvé")
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