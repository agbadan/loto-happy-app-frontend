// src/utils/withdrawalsAPI.ts

import apiClient from '../services/apiClient';
import { Withdrawal, FinancialStats } from '../types';

/**
 * Récupère les statistiques financières globales depuis l'API.
 */
export const getGlobalFinancialStats = async (): Promise<FinancialStats> => {
    const response = await apiClient.get<FinancialStats>('/api/admin/financial-stats/global');
    return response.data;
};

/**
 * Récupère la liste de toutes les demandes de retrait.
 * CORRECTION FINALE : La réponse de l'API est un objet { items: [...] }. Nous devons extraire le tableau 'items'.
 */
export const getWithdrawals = async (): Promise<Withdrawal[]> => {
    // On s'attend à recevoir une structure comme { items: Withdrawal[] }
    const response = await apiClient.get<{ items: Withdrawal[] }>('/api/admin/withdrawals/');
    return response.data.items; // On retourne seulement le tableau contenu dans la clé 'items'
};

/**
 * Met à jour le statut d'une demande de retrait (approuve ou rejette).
 */
export const updateWithdrawalStatus = async (
  withdrawalId: number | string,
  status: 'approved' | 'rejected'
): Promise<Withdrawal> => {
    const response = await apiClient.patch<Withdrawal>(
        `/api/admin/withdrawals/${withdrawalId}/`,
        { status }
    );
    return response.data;
};


// --- FONCTIONS JOUEUR (INCHANGÉES) ---
export interface WithdrawalRequest {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  provider: string;
  withdrawalPhoneNumber: string;
  playerInfo: {
    id: string;
    username: string;
    phoneNumber: string;
  };
}

export const createWithdrawalRequest = async (requestData: {
  amount: number;
  provider: string;
  withdrawalPhoneNumber: string;
}): Promise<WithdrawalRequest> => {
  const response = await apiClient.post<WithdrawalRequest>('/api/withdrawals/', requestData);
  return response.data;
};

export const getUserWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  const response = await apiClient.get<WithdrawalRequest[]>('/api/withdrawals/');
  return response.data;
};