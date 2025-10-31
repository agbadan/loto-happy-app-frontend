// src/utils/withdrawalsAPI.ts

import apiClient from './apiClient';

// --- INTERFACES BASÉES SUR L'API FINALE ---

interface WithdrawalPlayerInfo {
    id: string;
    username: string;
    phoneNumber: string;
}

export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  provider: string;
  withdrawalPhoneNumber: string;
  playerInfo: WithdrawalPlayerInfo;
}

export interface PaginatedWithdrawalsResponse {
    total: number;
    items: WithdrawalRequest[];
}

export interface FinancialStats {
    totalStakes: number;
    totalWinnings: number;
    netProfit: number;
    totalPlayers: number;
}


// --- FONCTIONS ADMIN ---

/**
 * Récupère les statistiques financières globales.
 */
export const getFinancialStatsAPI = async (): Promise<FinancialStats> => {
    try {
        const response = await apiClient.get<FinancialStats>('/api/admin/financial-stats/global/');
        return response.data;
    } catch (error) {
        console.error("Erreur stats financières:", error);
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
        const response = await apiClient.get<PaginatedWithdrawalsResponse>(`/api/admin/withdrawals/`, {
            params: { status }
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur demandes (${status}):`, error);
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
            `/api/admin/withdrawals/${withdrawalId}/process/`,
            payload
        );
        return response.data;
    } catch (error) {
        console.error(`Erreur traitement demande ${withdrawalId}:`, error);
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
  const response = await apiClient.post<WithdrawalRequest>('/api/withdrawals/', requestData);
  return response.data;
};

/**
 * Récupère les demandes de retrait de l'utilisateur connecté (placeholder).
 * On garde cette fonction car elle est peut-être utilisée ailleurs, même si elle ne fait rien.
 */
export const getUserWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  console.warn("La fonction getUserWithdrawalRequests n'est pas encore implémentée côté backend.");
  return [];
};