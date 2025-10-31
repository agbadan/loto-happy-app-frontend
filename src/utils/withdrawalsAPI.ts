// src/utils/withdrawalsAPI.ts

import apiClient from '../services/apiClient';
// CORRECTION: Import des types centraux pour être cohérent avec le reste de l'application.
// Assurez-vous que ces types sont bien définis dans un fichier comme src/types.ts
import { Withdrawal, FinancialStats } from '../types';

// --- INTERFACES POUR D'AUTRES PARTIES DE L'APPLICATION (ex: Espace Joueur) ---
// On conserve les interfaces qui pourraient être utilisées ailleurs.
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

// --- FONCTIONS ADMIN (CORRIGÉES) ---

/**
 * Récupère les statistiques financières globales.
 * CORRECTION: Renommage de getFinancialStatsAPI en getGlobalFinancialStats pour correspondre à AdminFinance.tsx.
 */
export const getGlobalFinancialStats = async (): Promise<FinancialStats> => {
    const response = await apiClient.get<FinancialStats>('/api/admin/financial-stats/global/');
    return response.data;
};

/**
 * Récupère LA LISTE COMPLÈTE de toutes les demandes de retrait.
 * CORRECTION: Renommage et simplification.
 * - Renommée en getWithdrawals.
 * - Ne prend plus de paramètre 'status' car on récupère tout d'un coup.
 * - Renvoie un simple tableau Withdrawal[] au lieu d'un objet paginé.
 */
export const getWithdrawals = async (): Promise<Withdrawal[]> => {
    const response = await apiClient.get<Withdrawal[]>('/api/admin/withdrawals/');
    return response.data;
};

/**
 * Met à jour le statut d'une demande de retrait (approuve ou rejette).
 * CORRECTION: Refactorisation pour correspondre à AdminFinance.tsx et à une approche REST plus standard.
 * - Renommée en updateWithdrawalStatus.
 * - Utilise la méthode PATCH pour une mise à jour partielle.
 * - L'endpoint est simplifié.
 * - Le payload envoie le nouveau statut.
 */
export const updateWithdrawalStatus = async (
  withdrawalId: number | string, // L'ID peut être un nombre ou une chaîne
  status: 'approved' | 'rejected'
): Promise<Withdrawal> => {
    const response = await apiClient.patch<Withdrawal>(
        `/api/admin/withdrawals/${withdrawalId}/`,
        { status }
    );
    return response.data;
};


// --- FONCTIONS JOUEUR (INCHANGÉES) ---

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
 * Récupère les demandes de retrait de l'utilisateur connecté.
 */
export const getUserWithdrawalRequests = async (): Promise<WithdrawalRequest[]> => {
  // Cette fonction n'est probablement pas implémentée côté backend, mais on la garde.
  const response = await apiClient.get<WithdrawalRequest[]>('/api/withdrawals/');
  return response.data;
};