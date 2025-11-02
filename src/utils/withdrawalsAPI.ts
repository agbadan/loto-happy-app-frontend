// src/utils/withdrawalsAPI.ts

import apiClient from '../services/apiClient';
import { Withdrawal, FinancialStats } from '../types';

/**
 * Récupère les statistiques financières globales depuis l'API pour le tableau de bord admin.
 * @returns {Promise<FinancialStats>} Les statistiques financières.
 */
export const getGlobalFinancialStats = async (): Promise<FinancialStats> => {
    const response = await apiClient.get<FinancialStats>('/api/admin/financial-stats/global');
    return response.data;
};

/**
 * Récupère la liste de toutes les demandes de retrait pour le panel admin.
 * @returns {Promise<Withdrawal[]>} Une liste des demandes de retrait.
 */
export const getWithdrawals = async (): Promise<Withdrawal[]> => {
    const response = await apiClient.get<{ items: Withdrawal[] }>('/api/admin/withdrawals/');
    // L'API enveloppe la liste dans un objet { items: [...] }
    return response.data.items;
};

/**
 * Traite une demande de retrait (approuve ou rejette).
 * C'est la fonction qui corrigeait le bug '404 undefined'.
 * @param {string} withdrawalId - L'ID de la demande de retrait à traiter.
 * @param {'approve' | 'reject'} action - L'action à effectuer.
 * @param {string} [reason] - Le motif du rejet (obligatoire si action est 'reject').
 * @returns {Promise<Withdrawal>} La demande de retrait mise à jour après traitement.
 */
export const processWithdrawalRequest = async (
  withdrawalId: string,
  action: 'approve' | 'reject',
  reason?: string
): Promise<Withdrawal> => {
    // On s'assure que l'ID n'est pas undefined avant de faire l'appel.
    if (!withdrawalId) {
        throw new Error("L'ID de la demande de retrait est manquant.");
    }

    const body: { action: 'approve' | 'reject'; reason?: string } = { action };
    
    // On ajoute le motif au corps de la requête uniquement si c'est un rejet.
    if (action === 'reject') {
        body.reason = reason;
    }

    // L'URL est maintenant construite dynamiquement avec le withdrawalId, ce qui résout le 404.
    const response = await apiClient.post<Withdrawal>(
        `/api/admin/withdrawals/${withdrawalId}/process`,
        body
    );

    return response.data;
};


// --- FONCTIONS CÔTÉ JOUEUR (INCHANGÉES) ---

// Note: Le type WithdrawalRequest est peut-être redondant si vous avez déjà un type Withdrawal global dans src/types.ts
// Vous pourriez envisager de les fusionner si leurs structures sont identiques.
export interface WithdrawalRequest {
  _id: string;
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

/**
 * Crée une nouvelle demande de retrait pour le joueur connecté.
 * @param {object} requestData - Les données de la demande de retrait.
 * @returns {Promise<WithdrawalRequest>} La nouvelle demande de retrait créée.
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
 * Récupère l'historique des demandes de retrait pour le joueur connecté.
 * @returns {Promise<WithdrawalRequest[]>} La liste des demandes de retrait de l'utilisateur.
 */
export const getUserWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  const response = await apiClient.get<WithdrawalRequest[]>('/api/withdrawals/');
  return response.data;
};