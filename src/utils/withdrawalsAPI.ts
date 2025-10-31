// src/utils/withdrawalsAPI.ts

import apiClient from './apiClient';

// --- INTERFACES BASÉES SUR L'API FINALE ---

// Interface pour les informations du joueur incluses dans une demande de retrait
interface WithdrawalPlayerInfo {
    id: string;
    username: string;
    phoneNumber: string;
}

// Interface pour un objet de demande de retrait, telle que retournée par l'API
export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  provider: string; // Ajout basé sur le code précédent, à confirmer si présent dans la réponse
  withdrawalPhoneNumber: string; // Ajout basé sur le code précédent, à confirmer si présent
  playerInfo: WithdrawalPlayerInfo;
  // ... autres champs potentiels comme 'processedDate'
}

// Interface pour la réponse paginée des demandes de retrait
export interface PaginatedWithdrawalsResponse {
    total: number;
    items: WithdrawalRequest[];
}

// Interface pour les statistiques financières
export interface FinancialStats {
    totalStakes: number;
    totalWinnings: number;
    netProfit: number;
    totalPlayers: number; // Le backend a confirmé 'totalPlayers'
}


// --- FONCTIONS ADMIN ---

/**
 * Récupère les statistiques financières globales.
 */
export const getFinancialStatsAPI = async (): Promise<FinancialStats> => {
    try {
        const response = await apiClient.get<FinancialStats>('/api/admin/financial-stats/global');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques financières:", error);
        throw error;
    }
};

/**
 * Récupère une page de demandes de retrait, filtrées par statut.
 */
export const getAllWithdrawalRequestsAPI = async (
  status: 'pending' | 'approved' | 'rejected'
): Promise<PaginatedWithdrawalsResponse> => {
    try {
        const response = await apiClient.get<PaginatedWithdrawalsResponse>(`/api/admin/withdrawals`, {
            params: { status } // Le backend a confirmé le paramètre 'status'
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des demandes (${status}):`, error);
        // Retourne un objet de pagination vide pour ne pas faire planter l'UI
        return { total: 0, items: [] };
    }
};

/**
 * Approuve ou rejette une demande de retrait.
 */
export const processWithdrawalRequestAPI = async (
  withdrawalId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<WithdrawalRequest> => {
    try {
        const payload = action === 'reject' ? { action, reason } : { action };
        const response = await apiClient.post<WithdrawalRequest>(
            `/api/admin/withdrawals/${withdrawalId}/process`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error(`Erreur lors du traitement de la demande ${withdrawalId}:`, error);
        throw error;
    }
};


// --- FONCTIONS JOUEUR ---

/**
 * Permet à un joueur de créer une nouvelle demande de retrait.
 */
export const createWithdrawalRequest = async (requestData: {
  amount: number;
  provider: string;
  withdrawalPhoneNumber: string;
}): Promise<WithdrawalRequest> => {
  // On ajoute le slash final par cohérence
  const response = await apiClient.post<WithdrawalRequest>('/api/withdrawals/', requestData);
  return response.data;
};

/**
 * Récupère les demandes de retrait de l'utilisateur connecté (placeholder).
 */
export const getUserWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  console.warn("La fonction getUserWithdrawalRequests n'est pas encore implémentée côté backend.");
  return [];
};