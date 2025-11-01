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
 */
export const getWithdrawals = async (): Promise<Withdrawal[]> => {
    const response = await apiClient.get<{ items: Withdrawal[] }>('/api/admin/withdrawals/');
    return response.data.items;
};

/**
 * CORRIGÉ : Traite une demande de retrait (approuve ou rejette) en utilisant la bonne route et méthode.
 * @param withdrawalId - L'ID de la demande à traiter.
 * @param action - L'action à effectuer : 'approve' ou 'reject'.
 * @param reason - Le motif, obligatoire si l'action est 'reject'.
 */
export const processWithdrawalRequest = async (
  withdrawalId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<Withdrawal> => {
    const body: { action: 'approve' | 'reject'; reason?: string } = { action };
    if (action === 'reject') {
        body.reason = reason;
    }

    const response = await apiClient.post<Withdrawal>(
        `/api/admin/withdrawals/${withdrawalId}/process`,
        body
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