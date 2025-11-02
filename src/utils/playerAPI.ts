// src/utils/playerAPI.ts

import apiClient from '../services/apiClient_';

// --- INTERFACES POUR LES JOUEURS ---

export interface Player {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: "player";
  status: "active" | "suspended";
  createdAt: string;
  lastLogin: string | null;
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance: number | null;
}

// --- FONCTIONS POUR L'ADMIN ---

/**
 * Récupère une page de joueurs depuis l'API.
 * @returns Un tableau de joueurs.
 */
export const getPlayersPage = async (page: number = 1, size: number = 10): Promise<Player[]> => {
  try {
    const response = await apiClient.get<Player[]>('/api/players/', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la page de joueurs:", error);
    return []; // Retourne un tableau vide en cas d'erreur pour éviter un crash
  }
};

/**
 * Ajuste le solde d'un joueur (solde de jeu ou solde de gains).
 * @returns L'objet joueur mis à jour.
 */
export const adjustPlayerBalanceAPI = async (
  playerId: string, 
  amount: number, 
  balanceType: 'game' | 'winnings', 
  reason: string
): Promise<Player> => {
  const endpoint = `/api/admin/players/${playerId}/adjust-balance`;
  const payload = { amount, balanceType, reason };
  const response = await apiClient.post<Player>(endpoint, payload);
  return response.data;
};


// --- INTERFACES ET FONCTIONS POUR LE JOUEUR CONNECTÉ ---

export interface PlayerTransaction {
  id: string;
  userId: string;
  type: 'BET' | 'WIN' | 'RECHARGE' | 'WITHDRAWAL' | 'ADJUSTMENT' | 'REFUND';
  description: string;
  amount: number;
  balanceAfterGame: number;
  balanceAfterWinnings: number;
  date: string;
  metadata?: { [key: string]: any };
}

/**
 * Récupère l'historique des transactions du joueur actuellement connecté.
 * @returns Un tableau de transactions.
 */
export const getMyTransactionHistory = async (page: number = 1, size: number = 20): Promise<PlayerTransaction[]> => {
  try {
    const response = await apiClient.get<PlayerTransaction[]>('/api/players/me/transactions', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des transactions:", error);
    return [];
  }
};