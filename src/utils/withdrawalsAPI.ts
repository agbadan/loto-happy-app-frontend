// src/utils/withdrawalsAPI.ts

import apiClient from '../services/apiClient';
import { Withdrawal, FinancialStats } from '../types';

/**
 * Récupère les statistiques financières globales depuis l'API.
 * CORRECTION FINALE: Le backend confirme que l'URL ne doit PAS avoir de slash final.
 */
export const getGlobalFinancialStats = async (): Promise<FinancialStats> => {
    const response = await apiClient.get<FinancialStats>('/api/admin/financial-stats/global'); // Slash final retiré
    return response.data;
};

/**
 * Récupère la liste de toutes les demandes de retrait.
 * NOTE: On garde le slash ici, car cette route fonctionne déjà.
 */
export const getWithdrawals = async (): Promise<Withdrawal[]> => {
    const response = await apiClient.get<Withdrawal[]>('/api/admin/withdrawals/');
    return response.data;
};

/**
 * Met à jour le statut d'une demande de retrait (approuve ou rejette).
 * NOTE: On garde le slash ici, car cette route fonctionne déjà.
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