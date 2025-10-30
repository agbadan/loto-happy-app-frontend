/**
 * NOUVEAU SYSTÈME D'AUTHENTIFICATION - API Backend
 * Remplace l'ancien système localStorage
 */

import api, { ApiError, saveToken, getToken, removeToken, DEV_MODE } from './apiClient';
// Import des fonctions de l'ancien système pour fallback
import * as oldAuth from './auth';

// ===== INTERFACES (reprises de auth.ts) =====

export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  email: string;
  role: 'player' | 'reseller' | 'admin';
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance?: number; // Pour revendeurs uniquement
  status?: 'active' | 'suspended';
}

export interface PlayerTransaction {
  id: string;
  type: 'RECHARGE' | 'BET' | 'CONVERSION' | 'WIN' | 'WITHDRAWAL';
  description: string;
  amount: number;
  balanceAfter: number;
  date: string;
  metadata?: {
    gameName?: string;
    resellerName?: string;
    fromBalance?: 'winnings' | 'game';
    toBalance?: 'winnings' | 'game';
    provider?: string;
    phoneNumber?: string;
  };
}

// Clé pour stocker l'utilisateur dans le state (temporaire, pour UI)
const CURRENT_USER_KEY = 'lottoHappyUser';

// ===== GESTION DE L'UTILISATEUR LOCAL (STATE UI) =====

export function saveUserToLocalState(user: User): void {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getUserFromLocalState(): User | null {
  const userJSON = localStorage.getItem(CURRENT_USER_KEY);
  return userJSON ? JSON.parse(userJSON) : null;
}

export function removeUserFromLocalState(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// ===== AUTHENTIFICATION =====

/**
 * Inscription d'un nouvel utilisateur (Joueur ou Revendeur)
 */
export async function registerUser(userData: {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: 'player' | 'reseller';
}): Promise<{ user: User, token: string }> {
  try {
    const response = await api.post<{ access_token: string; token_type: string }>(
      '/api/auth/register',
      userData,
      { skipAuth: true }
    );

    const token = response.access_token;
    const user = await getCurrentUser(token);
    
    return { user, token };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de l\'inscription');
  }
}

/**
 * Connexion utilisateur
 * IMPORTANT: Le backend attend format application/x-www-form-urlencoded
 */
export async function loginUser(credentials: {
  emailOrPhone: string; // Email ou numéro de téléphone
  password: string;
}): Promise<{ user: User, token: string }> {
  try {
    // Préparer les données au format form-urlencoded
    const formData = new URLSearchParams();
    formData.append('username', credentials.emailOrPhone); // Backend attend 'username'
    formData.append('password', credentials.password);

    const response = await api.post<{ access_token: string; token_type: string }>(
      '/api/auth/login',
      formData,
      { useFormData: true, skipAuth: true }
    );

    const token = response.access_token;
    const user = await getCurrentUser(token);
    
    return { user, token };
  } catch (error) {
    if (error instanceof ApiError) {
      // Messages d'erreur personnalisés
      if (error.code === 'INVALID_CREDENTIALS' || error.status === 401) {
        throw new Error('Email/téléphone ou mot de passe incorrect');
      }
      throw error;
    }
    throw new Error('Erreur lors de la connexion');
  }
}

/**
 * Connexion Google OAuth
 */
export async function loginWithGoogle(googleToken: string, phoneNumber: string): Promise<{ user: User, token: string }> {
  try {
    const response = await api.post<{ access_token: string; token_type: string; is_new_user: boolean }>(
      '/api/auth/google',
      { google_token: googleToken, phone_number: phoneNumber },
      { skipAuth: true }
    );

    const token = response.access_token;
    const user = await getCurrentUser(token);
    
    return { user, token };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la connexion Google');
  }
}

/**
 * Récupérer l'utilisateur actuellement connecté
 */
export async function getCurrentUser(token: string): Promise<User> {
  try {
    if (!token) {
      throw new Error('Non authentifié');
    }

    const user = await api.get<User>('/api/auth/me', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    
    // Sauvegarder dans le state local pour l'UI
    saveUserToLocalState(user);
    
    return user;
  } catch (error) {
    // Si erreur (token expiré, etc.), déconnecter
    logoutUser();
    throw error;
  }
}

/**
 * Rafraîchir les données utilisateur (force)
 */
export async function refreshUserData(): Promise<User> {
  try {
    const token = getToken();
    if (!token) {
        throw new Error("No token found");
    }
    return await getCurrentUser(token);
  } catch (error) {
    // FALLBACK: Si erreur réseau, retourner l'utilisateur localStorage
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR' && DEV_MODE.useLocalStorageFallback) {
      const oldUser = oldAuth.getCurrentUser();
      if (oldUser) {
        const user: User = {
          id: oldUser.id,
          username: oldUser.username || oldUser.phoneNumber,
          phoneNumber: oldUser.phoneNumber,
          email: oldUser.email || '',
          role: oldUser.role,
          balanceGame: oldUser.balanceGame,
          balanceWinnings: oldUser.balanceWinnings,
          tokenBalance: oldUser.tokenBalance,
          status: 'active',
        };
        saveUserToLocalState(user);
        return user;
      }
    }
    throw error;
  }
}

/**
 * Déconnexion
 */
export function logoutUser(): void {
  removeToken();
  removeUserFromLocalState();
}

/**
 * Vérifier si l'utilisateur est connecté
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Changer le mot de passe
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    await api.put('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === 'INVALID_PASSWORD') {
        throw new Error('Mot de passe actuel incorrect');
      }
      throw error;
    }
    throw new Error('Erreur lors du changement de mot de passe');
  }
}

// ===== TRANSACTIONS JOUEUR =====

/**
 * Récupérer l'historique des transactions d'un joueur
 */
export async function getPlayerTransactionHistory(userId?: string): Promise<PlayerTransaction[]> {
  try {
    const endpoint = userId 
      ? `/api/players/${userId}/transactions`
      : '/api/players/me/transactions';
    
    return await api.get<PlayerTransaction[]>(endpoint);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des transactions');
  }
}

/**
 * Convertir les gains en solde de jeu
 */
export async function convertWinningsToGame(amount: number): Promise<{
  newBalanceGame: number;
  newBalanceWinnings: number;
}> {
  try {
    const result = await api.post<{ new_balance_game: number; new_balance_winnings: number }>(
      '/api/players/me/convert',
      { amount }
    );

    // Rafraîchir l'utilisateur
    await refreshUserData();

    return {
      newBalanceGame: result.new_balance_game,
      newBalanceWinnings: result.new_balance_winnings,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === 'INSUFFICIENT_BALANCE') {
        throw new Error('Solde de gains insuffisant');
      }
      throw error;
    }
    throw new Error('Erreur lors de la conversion');
  }
}

// ===== REVENDEURS =====

/**
 * Créditer le compte d'un joueur (fonction revendeur)
 */
export async function resellerCreditPlayer(
  resellerId: string,
  playerPhoneNumber: string,
  amount: number
): Promise<{
  resellerNewBalance: number;
  playerNewBalance: number;
}> {
  try {
    const result = await api.post<{
      reseller_new_balance: number;
      player_new_balance: number;
    }>(
      `/api/resellers/${resellerId}/credit-player`,
      {
        player_phone_number: playerPhoneNumber,
        amount,
      }
    );

    // Rafraîchir l'utilisateur (revendeur)
    await refreshUserData();

    return {
      resellerNewBalance: result.reseller_new_balance,
      playerNewBalance: result.player_new_balance,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === 'INSUFFICIENT_BALANCE') {
        throw new Error('Solde de tokens insuffisant');
      }
      if (error.code === 'PLAYER_NOT_FOUND') {
        throw new Error('Aucun joueur trouvé avec ce numéro');
      }
      throw error;
    }
    throw new Error('Erreur lors du crédit');
  }
}

/**
 * Récupérer l'historique des transactions d'un revendeur
 */
export async function getResellerTransactionHistory(resellerId?: string): Promise<any[]> {
  try {
    const endpoint = resellerId
      ? `/api/resellers/${resellerId}/transactions`
      : '/api/resellers/me/transactions';
    
    return await api.get<any[]>(endpoint);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des transactions');
  }
}

// ===== ADMIN =====

/**
 * Récupérer tous les joueurs (admin)
 */
export async function getAllPlayers(): Promise<User[]> {
  try {
    return await api.get<User[]>('/api/players');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des joueurs');
  }
}

/**
 * Récupérer tous les revendeurs (admin)
 */
export async function getAllResellers(): Promise<User[]> {
  try {
    return await api.get<User[]>('/api/resellers');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des revendeurs');
  }
}

/**
 * Suspendre un utilisateur (admin)
 */
export async function suspendUser(userId: string): Promise<void> {
  try {
    await api.post(`/api/admin/users/${userId}/suspend`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la suspension');
  }
}

/**
 * Activer un utilisateur (admin)
 */
export async function activateUser(userId: string): Promise<void> {
  try {
    await api.post(`/api/admin/users/${userId}/activate`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de l\'activation');
  }
}

// ===== HELPERS =====

/**
 * Initialiser l'authentification au chargement de l'app
 * Retourne l'utilisateur si connecté, null sinon
 */
export async function initAuth(): Promise<User | null> {
  try {
    const token = getToken();
    if (!token) {
      // FALLBACK: Vérifier si un utilisateur est connecté via l'ancien système
      if (DEV_MODE.useLocalStorageFallback && oldAuth.isUserLoggedIn()) {
        console.warn('⚠️ Utilisation du mode localStorage (backend non accessible)');
        const oldUser = oldAuth.getCurrentUser();
        if (oldUser) {
          const user: User = {
            id: oldUser.id,
            username: oldUser.username || oldUser.phoneNumber,
            phoneNumber: oldUser.phoneNumber,
            email: oldUser.email || '',
            role: oldUser.role,
            balanceGame: oldUser.balanceGame,
            balanceWinnings: oldUser.balanceWinnings,
            tokenBalance: oldUser.tokenBalance,
            status: 'active',
          };
          saveUserToLocalState(user);
          return user;
        }
      }
      return null;
    }

    // Vérifier que le token est encore valide
    const user = await getCurrentUser(token);
    return user;
  } catch (error) {
    // FALLBACK: Si erreur réseau et mode fallback activé
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR' && DEV_MODE.useLocalStorageFallback) {
      console.warn('⚠️ Backend non accessible lors de initAuth, utilisation localStorage');
      if (oldAuth.isUserLoggedIn()) {
        const oldUser = oldAuth.getCurrentUser();
        if (oldUser) {
          const user: User = {
            id: oldUser.id,
            username: oldUser.username || oldUser.phoneNumber,
            phoneNumber: oldUser.phoneNumber,
            email: oldUser.email || '',
            role: oldUser.role,
            balanceGame: oldUser.balanceGame,
            balanceWinnings: oldJser.balanceWinnings,
            tokenBalance: oldUser.tokenBalance,
            status: 'active',
          };
          saveUserToLocalState(user);
          return user;
        }
      }
    }
    
    // Token expiré ou invalide
    logoutUser();
    return null;
  }
}
