// src/utils/authAPI.ts

// On importe notre client Axios centralisé, c'est la seule dépendance nécessaire.
import apiClient from '../services/apiClient';

// ===== INTERFACES =====
// Définit la structure des données utilisateur que nous recevons du backend.
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

// Définit la structure de la réponse de l'endpoint /login.
interface LoginResponse {
  access_token: string;
  token_type: string;
}

// ===== FONCTIONS D'API =====

/**
 * Tente de connecter un utilisateur via son identifiant (email ou téléphone) et son mot de passe.
 * C'est la fonction la plus importante à corriger.
 */
export const loginUser = async (credentials: {
  emailOrPhone: string;
  password: string;
}): Promise<{ user: User; token: string }> => {
  // 1. Préparer les données au format 'application/x-www-form-urlencoded'
  // C'est ce que notre backend FastAPI attend pour l'endpoint /login.
  const formData = new URLSearchParams();
  formData.append('username', credentials.emailOrPhone); // Le backend s'attend au champ 'username'.
  formData.append('password', credentials.password);

  // 2. Appeler l'endpoint /login pour obtenir le token JWT.
  // Axios enverra automatiquement le bon Content-Type car il détecte URLSearchParams.
  const loginResponse = await apiClient.post<LoginResponse>('/api/auth/login', formData);
  const token = loginResponse.data.access_token;

  if (!token) {
    throw new Error("La connexion a échoué, aucun token reçu.");
  }
  
  // 3. Une fois que nous avons le token, nous l'utilisons pour récupérer les informations de l'utilisateur.
  const user = await getCurrentUser(token);

  // 4. On retourne l'utilisateur et le token pour que le AuthContext puisse les stocker.
  return { user, token };
};


/**
 * Récupère les informations de l'utilisateur actuellement authentifié en utilisant un token.
 */
export const getCurrentUser = async (token: string): Promise<User> => {
  // On fait un appel GET à /me avec le token dans le header Authorization.
  // Notre 'apiClient' gère l'ajout du header, mais ici nous le passons manuellement
  // car nous venons de le recevoir et il n'est pas encore stocké globalement.
  const response = await apiClient.get<User>('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};


/**
 * Inscrit un nouveau joueur.
 */
export const registerUser = async (userData: any): Promise<{ user: User; token: string }> => {
  // L'endpoint /register attend du JSON, donc on passe l'objet directement.
  await apiClient.post<User>('/api/auth/register', userData);
  
  // Après une inscription réussie, on connecte automatiquement l'utilisateur pour obtenir un token.
  return await loginUser({
    emailOrPhone: userData.email,
    password: userData.password,
  });
};


/**
 * Gère la connexion via Google.
 */
export const loginWithGoogle = async (googleToken: string, name: string): Promise<{ user: User, token: string, isNewUser?: boolean }> => {
  // Le backend /api/auth/google n'existe pas pour l'instant.
  // Cette fonction est un placeholder et échouera.
  // Il faudra l'implémenter côté backend si nécessaire.
  console.warn("La fonctionnalité de connexion Google n'est pas encore implémentée côté backend.");
  throw new Error("Connexion Google non disponible.");
  // Quand le backend sera prêt, le code ressemblera à ça :
  // const response = await apiClient.post('/api/auth/google', { googleToken, name });
  // return response.data.data;
};


/**
 * Déconnecte l'utilisateur (opération côté client).
 */
export const logoutUser = () => {
  // Il suffit de supprimer le token. Il n'y a pas d'appel API à faire.
  console.log("Déconnexion de l'utilisateur.");
};

// Exporter ApiError si d'autres parties du code en ont besoin
export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const changePassword = async (passwordData: { current_password: string; new_password: string }): Promise<void> => {
  // L'endpoint attend un corps avec 'current_password' et 'new_password'.
  await apiClient.put('/api/auth/change-password', passwordData);
  // Pas de retour de données si succès (204 No Content).
};

// On n'exporte pas les autres fonctions complexes (suspend, etc.) pour l'instant
// afin de se concentrer sur la correction du bug principal.