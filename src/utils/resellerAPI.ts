// src/utils/resellerAPI.ts

import apiClient from '../services/apiClient';

// --- INTERFACES POUR LES REVENDEURS ---

export interface Reseller {
  _id: string; // L'ID du backend s'appelle '_id'
  id: string; // L'alias 'id' peut aussi être présent
  username: string;
  email: string;
  phoneNumber: string;
  role: "reseller";
  status: "active" | "suspended";
  createdAt: string;
  lastLogin: string | null;
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance: number | null;
}

// L'interface pour la création d'un revendeur
interface CreateResellerPayload {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  initialTokenBalance?: number; // Optionnel
}

// --- FONCTIONS API ---

/**
 * 1. Récupère une page de revendeurs.
 */
export const getResellersPage = async (page: number = 1, size: number = 10): Promise<Reseller[]> => {
  try {
    const response = await apiClient.get<Reseller[]>('/api/resellers/', {
      params: { page, size }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la page de revendeurs:", error);
    return [];
  }
};

/**
 * 2. Crée un nouveau revendeur.
 */
export const createResellerAPI = async (resellerData: CreateResellerPayload): Promise<Reseller> => {
  const response = await apiClient.post<Reseller>('/api/resellers/', resellerData);
  return response.data;
};

/**
 * 3. Met à jour le statut d'un utilisateur (générique).
 */
export const updateUserStatusAPI = async (userId: string, status: 'active' | 'suspended'): Promise<void> => {
  await apiClient.put(`/api/admin/users/${userId}/status`, { status });
};

/**
 * 4. Ajuste le solde de jetons d'un revendeur (crédit ou débit).
 */
export const adjustResellerBalanceAPI = async (resellerId: string, amount: number, reason: string): Promise<Reseller> => {
  const endpoint = `/api/admin/resellers/${resellerId}/adjust-balance`;
  const payload = { amount, reason };
  const response = await apiClient.post<Reseller>(endpoint, payload);
  return response.data;
};