// src/utils/withdrawalsAPI.ts

import apiClient from './apiClient';

// ===== INTERFACE =====
// Définit la structure d'une demande de retrait
export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  amount: number;
  provider: string; // TMoney, Flooz, etc.
  withdrawalPhoneNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string | null;
  processedBy?: string | null;
  rejectionReason?: string | null; // Ce champ n'est pas dans le backend actuel, mais on le garde
}

// ===== GESTION DES RETRAITS (côté Joueur) =====

/**
 * Permet à un joueur de créer une nouvelle demande de retrait.
 */
export const createWithdrawalRequest = async (requestData: {
  amount: number;
  provider: string;
  withdrawalPhoneNumber: string;
}): Promise<WithdrawalRequest> => {
  // Le backend attend 'withdrawalPhoneNumber', pas 'withdrawal_phone_number'
  const response = await apiClient.post<WithdrawalRequest>('/api/withdrawals', requestData);
  // Le backend ne renvoie pas le 'newBalanceWinnings', le AuthContext s'en chargera.
  return response.data;
};

/**
 * Récupère les demandes de retrait de l'utilisateur connecté.
 */
export const getUserWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  // Le backend n'a pas de route '/me' pour les retraits.
  // On va construire cette logique plus tard côté backend si nécessaire.
  console.warn("La fonction getUserWithdrawalRequests n'est pas encore implémentée côté backend.");
  return []; // Retourne un tableau vide pour l'instant.
  // const response = await apiClient.get<WithdrawalRequest[]>('/api/withdrawals/me');
  // return response.data;
};


// ===== GESTION DES RETRAITS (côté Admin) =====

/**
 * Récupère toutes les demandes de retrait, filtrées par statut (admin).
 */
export const getAllWithdrawalRequests = async (
  status: 'pending' | 'approved' | 'rejected' = 'pending'
): Promise<WithdrawalRequest[]> => {
  const response = await apiClient.get<WithdrawalRequest[]>(`/api/withdrawals`, {
    params: { status_filter: status } // Le backend attend 'status_filter'
  });
  return response.data;
};

/**
 * Approuve une demande de retrait (admin).
 */
export const approveWithdrawal = async (withdrawalId: string): Promise<WithdrawalRequest> => {
  const response = await apiClient.put<WithdrawalRequest>(`/api/withdrawals/${withdrawalId}/approve`);
  return response.data;
};

/**
 * Rejette une demande de retrait (admin).
 */
export const rejectWithdrawal = async (
  withdrawalId: string,
  reason: string
): Promise<WithdrawalRequest> => {
  const response = await apiClient.put<WithdrawalRequest>(
    `/api/withdrawals/${withdrawalId}/reject`,
    { reason }
  );
  // Le backend ne renvoie que la demande de retrait mise à jour.
  return response.data;
};