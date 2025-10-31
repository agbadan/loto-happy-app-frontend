// src/utils/playerAPI.ts

import apiClient from '../services/apiClient';

// --- INTERFACES POUR LES JOUEURS (POUR L'ADMIN) ---

export interface Player {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: "player";
  status: "active" | "suspended";
  createdAt: string;
  lastLogin: string | null;
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance: number;
}

export interface PaginatedPlayersResponse {
  items: Player[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// --- FONCTIONS POUR L'ADMIN ---

export const getPlayersPage = async (page: number = 1, size: number = 10): Promise<PaginatedPlayersResponse> => {
  const response = await apiClient.get<PaginatedPlayersResponse>('/api/players/', {
    params: { page, size }
  });
  return response.data;
};


// --- INTERFACES POUR LES TRANSACTIONS (POUR LE JOUEUR CONNECTÉ) ---

export interface PlayerTransaction {
  id: string;
  userId: string;
  type: 'BET' | 'WIN' | 'RECHARGE' | 'WITHDRAWAL' | 'ADJUSTMENT' | 'REFUND'; // Types possibles
  description: string;
  amount: number;
  balanceAfterGame: number;
  balanceAfterWinnings: number;
  date: string; // ISO 8601 format
  metadata?: { [key: string]: any }; // Objet flexible pour les détails
}

// --- FONCTIONS POUR LE JOUEUR CONNECTÉ ---

// La fonction que ProfileScreen essaie d'importer, maintenant avec la bonne signature
export const getMyTransactionHistory = async (page: number = 1, size: number = 20): Promise<PlayerTransaction[]> => {
  try {
    const response = await apiClient.get<PlayerTransaction[]>('/api/players/me/transactions', {
      params: { page, size }
    });
    // Le backend renvoie directement un tableau, donc on retourne response.data
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des transactions:", error);
    // En cas d'erreur, on retourne un tableau vide pour éviter de faire planter le composant
    return [];
  }
};