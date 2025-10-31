// src/utils/resellerAPI.ts

import apiClient from '../services/apiClient';

// --- INTERFACES BASÉES SUR L'API FINALE ---

export interface Reseller {
  id: string;
  _id?: string; // Garder par sécurité si l'API est incohérente
  username: string;
  email: string;
  phoneNumber: string;
  role: "reseller";
  status: "active" | "suspended";
  tokenBalance: number | null;
  // Autres champs que le backend pourrait renvoyer
  createdAt?: string;
  lastLogin?: string | null;
  balanceGame?: number;
  balanceWinnings?: number;
}

// Interface pour la réponse de la recherche de joueur
export interface FoundPlayer {
    id: string;
    username: string;
    phoneNumber: string;
}

// Interface pour un élément de l'historique de recharge
export interface RechargeHistoryItem {
    id: string;
    date: string;
    amount: number;
    playerCredited: FoundPlayer;
    resellerBalanceAfter: number;
}

// Interface pour la réponse paginée de l'historique
export interface PaginatedRechargeHistory {
    total: number;
    items: RechargeHistoryItem[];
}

// Interface pour le payload de création de revendeur
interface CreateResellerPayload {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  initialTokenBalance?: number;
}


// --- FONCTIONS API FINALES ---

/**
 * 1. Crédite le compte d'un joueur.
 * @param playerPhoneNumber Le numéro de téléphone du joueur à créditer.
 * @param amount Le montant à créditer.
 * @returns Un objet contenant un message de succès et les objets mis à jour du revendeur et du joueur.
 */
export const creditPlayerAccountAPI = async (playerPhoneNumber: string, amount: number) => {
  const response = await apiClient.post('/api/resellers/me/credit-player', {
    playerPhoneNumber,
    amount
  });
  return response.data;
};

/**
 * 2. Recherche un joueur par son numéro de téléphone.
 * @param phoneNumber Le numéro de téléphone complet (avec indicatif) du joueur.
 * @returns L'objet du joueur trouvé.
 */
export const findPlayerByPhoneAPI = async (phoneNumber: string): Promise<FoundPlayer> => {
  const response = await apiClient.get<FoundPlayer>('/api/resellers/find-player-by-phone', {
    params: { phoneNumber }
  });
  return response.data;
};

/**
 * 3. Récupère l'historique des recharges du revendeur connecté.
 * @param skip Le nombre d'éléments à sauter (pour la pagination).
 * @param limit Le nombre maximum d'éléments à retourner.
 * @returns Un objet contenant le total et la liste des transactions.
 */
export const getResellerHistoryAPI = async (skip: number = 0, limit: number = 20): Promise<PaginatedRechargeHistory> => {
  const response = await apiClient.get<PaginatedRechargeHistory>('/api/resellers/me/recharge-history', {
    params: { skip, limit }
  });
  return response.data;
};


// --- FONCTIONS ADMIN (gardées ici pour la cohérence) ---

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