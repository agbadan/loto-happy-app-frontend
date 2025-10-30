/**
 * NOUVEAU SYSTÈME DE GESTION DES RETRAITS - API Backend
 * Remplace l'ancien système localStorage
 */

import api, { ApiError } from './apiClient';
import { refreshUserData } from './authAPI';

// ===== INTERFACES =====

export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  phoneNumber: string;
  amount: number;
  provider: string; // TMoney, Flooz, MTN, Orange, Wave, Moov
  withdrawalPhoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  rejectionReason?: string;
}

// ===== GESTION DES RETRAITS =====

/**
 * Créer une demande de retrait
 */
export async function createWithdrawalRequest(requestData: {
  amount: number;
  provider: string;
  withdrawalPhoneNumber: string;
}): Promise<{
  withdrawal: WithdrawalRequest;
  newBalanceWinnings: number;
}> {
  try {
    const result = await api.post<{
      withdrawal: WithdrawalRequest;
      new_balance_winnings: number;
    }>('/api/withdrawals', {
      amount: requestData.amount,
      provider: requestData.provider,
      withdrawal_phone_number: requestData.withdrawalPhoneNumber,
    });

    // Rafraîchir les données utilisateur (solde de gains mis à jour)
    await refreshUserData();

    return {
      withdrawal: result.withdrawal,
      newBalanceWinnings: result.new_balance_winnings,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.code === 'INSUFFICIENT_BALANCE') {
        throw new Error('Solde de gains insuffisant');
      }
      if (error.code === 'WITHDRAWAL_MINIMUM_NOT_MET') {
        throw new Error('Le montant minimum de retrait est de 1000 F');
      }
      throw error;
    }
    throw new Error('Erreur lors de la demande de retrait');
  }
}

/**
 * Récupérer toutes les demandes de retrait (admin)
 */
export async function getAllWithdrawalRequests(
  status?: 'pending' | 'approved' | 'rejected'
): Promise<WithdrawalRequest[]> {
  try {
    const endpoint = status 
      ? `/api/withdrawals?status=${status}`
      : '/api/withdrawals';
    
    return await api.get<WithdrawalRequest[]>(endpoint);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des demandes de retrait');
  }
}

/**
 * Récupérer les demandes de retrait de l'utilisateur connecté
 */
export async function getUserWithdrawalRequests(): Promise<WithdrawalRequest[]> {
  try {
    return await api.get<WithdrawalRequest[]>('/api/withdrawals/me');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération de vos demandes de retrait');
  }
}

/**
 * Approuver une demande de retrait (admin)
 */
export async function approveWithdrawal(
  withdrawalId: string,
  notes?: string
): Promise<WithdrawalRequest> {
  try {
    return await api.put<WithdrawalRequest>(
      `/api/withdrawals/${withdrawalId}/approve`,
      { notes }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de l\'approbation du retrait');
  }
}

/**
 * Rejeter une demande de retrait (admin)
 * Le backend re-crédite automatiquement le solde du joueur
 */
export async function rejectWithdrawal(
  withdrawalId: string,
  reason: string
): Promise<{
  withdrawal: WithdrawalRequest;
  playerRefundedAmount: number;
  playerNewBalance: number;
}> {
  try {
    return await api.put<{
      withdrawal: WithdrawalRequest;
      player_refunded_amount: number;
      player_new_balance: number;
    }>(`/api/withdrawals/${withdrawalId}/reject`, {
      reason,
    }).then(result => ({
      withdrawal: result.withdrawal,
      playerRefundedAmount: result.player_refunded_amount,
      playerNewBalance: result.player_new_balance,
    }));
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors du rejet du retrait');
  }
}
