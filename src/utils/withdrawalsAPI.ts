// src/utils/withdrawalsAPI.ts

import apiClient from './apiClient';

// --- INTERFACES ---

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  provider: string;
  withdrawalPhoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string | null;
  processedBy?: string | null;
  rejectionReason?: string | null;
  // Ajout potentiel d'informations sur le joueur si le backend les renvoie
  playerInfo?: {
      phoneNumber: string;
  }
}

// Interface pour les statistiques financières, basée sur la demande au backend
export interface FinancialStats {
    totalStakes: number;
    totalWinnings: number;
    netProfit: number;
    activePlayers: number;
}


// --- FONCTIONS ADMIN ---

/**
 * Récupère les statistiques financières globales.
 */
export const getFinancialStatsAPI = async (): Promise<FinancialStats> => {
    try {
        // On utilise l'URL proposée, à confirmer par le backend
        const response = await apiClient.get<FinancialStats>('/api/admin/financial-stats');
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques financières:", error);
        throw error;
    }
};

/**
 * Récupère toutes les demandes de retrait, filtrées par statut.
 */
export const getAllWithdrawalRequestsAPI = async (
  status: 'pending' | 'approved' | 'rejected'
): Promise<WithdrawalRequest[]> => {
    try {
        // On utilise l'URL et le paramètre proposés, à confirmer par le backend
        const response = await apiClient.get<WithdrawalRequest[]>(`/api/admin/withdrawals`, {
            params: { status }
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération des demandes (${status}):`, error);
        return []; // Retourne un tableau vide en cas d'échec
    }
};

/**
 * Approuve ou rejette une demande de retrait.
 */
export const processWithdrawalRequestAPI = async (
  withdrawalId: string,
  action: 'approve' | 'reject',
  reason?: string // La raison est optionnelle, seulement pour le rejet
): Promise<WithdrawalRequest> => {
    try {
        // On utilise l'URL et le payload proposés, à confirmer par le backend
        const response = await apiClient.post<WithdrawalRequest>(
            `/api/admin/withdrawals/${withdrawalId}/process`,
            { action, reason }
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