// src/utils/playerAPI.ts

import apiClient from '../services/apiClient';

// --- INTERFACES POUR LES JOUEURS ---

// CORRECTION : L'interface est mise à jour pour correspondre à la réponse réelle de l'API.
export interface Player {
  _id: string; // Le backend renvoie '_id'
  username: string;
  email: string;
  phoneNumber: string;
  role: "player";
  status: "active" | "suspended";
  createdAt: string;
  lastLogin: string | null;
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance: number | null; // Le backend peut renvoyer 'null'
}

// CORRECTION : On supprime PaginatedPlayersResponse qui n'est pas utilisée.

// --- FONCTIONS POUR L'ADMIN ---

// CORRECTION : La fonction attend maintenant un simple tableau de joueurs.
export const getPlayersPage = async (page: number = 1, size: number = 10): Promise<Player[]> => {
  try {
    const response = await apiClient.get<Player[]>('/api/players/', {
      params: { page, size }
    });
    // La réponse est directement le tableau, on le retourne.
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la page de joueurs:", error);
    // On retourne un tableau vide en cas d'erreur pour que l'UI ne plante pas.
    return [];
  }
};


// --- INTERFACES POUR LES TRANSACTIONS (POUR LE JOUEUR CONNECTÉ) ---

// Cette partie était déjà correcte, on la garde telle quelle.
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

// --- FONCTIONS POUR LE JOUEUR CONNECTÉ ---

// Cette fonction était déjà correcte, on la garde telle quelle.
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