// src/utils/resellerAPI.ts

import apiClient from '../services/apiClient';

// --- INTERFACES BASÉES SUR L'API FINALE ---

export interface Reseller {
  id: string;
  _id?: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: "reseller";
  status: "active" | "suspended";
  tokenBalance: number | null;
  createdAt?: string;
  lastLogin?: string | null;
}

export interface FoundPlayer {
    id: string;
    username: string;
    phoneNumber: string;
}

export interface RechargeHistoryItem {
    id: string;
    date: string;
    amount: number;
    playerCredited: FoundPlayer;
    resellerBalanceAfter: number;
}

export interface PaginatedRechargeHistory {
    total: number;
    items: RechargeHistoryItem[];
}

interface CreateResellerPayload {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  initialTokenBalance?: number;
}


// --- FONCTIONS API FINALES POUR LE REVENDEUR CONNECTÉ ---

/**
 * 1. Crédite le compte d'un joueur.
 */
export const creditPlayerAccountAPI = async (playerPhoneNumber: string, amount: number) => {
  try {
    const response = await apiClient.post('/api/resellers/me/credit-player', {
      playerPhoneNumber,
      amount
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors du crédit du joueur:", error);
    throw error; // Propage l'erreur pour que le composant l'affiche
  }
};

/**
 * 2. Recherche un joueur par son numéro de téléphone.
 */
export const findPlayerByPhoneAPI = async (phoneNumber: string): Promise<FoundPlayer> => {
  try {
    const response = await apiClient.get<FoundPlayer>('/api/resellers/find-player-by-phone', {
      params: { phoneNumber }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la recherche du joueur:", error);
    throw error;
  }
};

/**
 * 3. Récupère l'historique des recharges du revendeur connecté.
 */
export const getResellerHistoryAPI = async (skip: number = 0, limit: number = 20): Promise<PaginatedRechargeHistory> => {
  try {
    const response = await apiClient.get<PaginatedRechargeHistory>('/api/resellers/me/recharge-history', {
      params: { skip, limit }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    // On retourne un objet vide par défaut pour ne pas planter l'UI
    return { total: 0, items: [] };
  }
};


// --- FONCTIONS POUR L'ADMIN ---

/**
 * Crée un nouveau revendeur (action d'admin).
 */
export const createResellerAPI = async (resellerData: CreateResellerPayload): Promise<Reseller> => {
    const response = await apiClient.post<Reseller>('/api/resellers/', resellerData);
    return response.data;
};

/**
 * Récupère une page de revendeurs (action d'admin).
 */
export const getResellersPage = async (page: number = 1, size: number = 10): Promise<Reseller[]> => {
    try {
        const response = await apiClient.get<Reseller[]>('/api/resellers/', { params: { page, size } });
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de la page de revendeurs:", error);
        return [];
    }
};

/**
 * Met à jour le statut d'un utilisateur (action d'admin).
 */
export const updateUserStatusAPI = async (userId: string, status: 'active' | 'suspended'): Promise<void> => {
    await apiClient.put(`/api/admin/users/${userId}/status`, { status });
};

/**
 * Ajuste le solde de jetons d'un revendeur (action d'admin).
 */
export const adjustResellerBalanceAPI = async (resellerId: string, amount: number, reason: string): Promise<Reseller> => {
    const endpoint = `/api/admin/resellers/${resellerId}/adjust-balance`;
    const payload = { amount, reason };
    const response = await apiClient.post<Reseller>(endpoint, payload);
    return response.data;
};