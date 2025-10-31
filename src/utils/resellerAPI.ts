// src/utils/resellerAPI.ts
import apiClient from '../services/apiClient';

// L'interface complète, basée sur la réponse exacte du backend
export interface Reseller {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: "reseller";
  status: "active" | "suspended";
  createdAt: string;
  lastLogin: string | null;
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance: number;
}

// L'interface pour la réponse paginée, comme pour les joueurs
export interface PaginatedResellersResponse {
  items: Reseller[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Interface pour la création d'un revendeur, basée sur le modèle ResellerCreate
interface CreateResellerPayload {
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  initialTokenBalance?: number; // Optionnel
}


// 1. Lister les revendeurs (avec pagination)
export const getResellersPage = async (page: number = 1, size: number = 10): Promise<PaginatedResellersResponse> => {
  const response = await apiClient.get<PaginatedResellersResponse>('/api/resellers/', {
    params: { page, size }
  });
  return response.data;
};

// 2. Créer un nouveau revendeur
export const createResellerAPI = async (resellerData: CreateResellerPayload): Promise<Reseller> => {
  const response = await apiClient.post<Reseller>('/api/resellers', resellerData);
  return response.data;
};

// 3. Mettre à jour le statut d'un utilisateur (générique)
export const updateUserStatusAPI = async (userId: string, status: 'active' | 'suspended'): Promise<void> => {
  await apiClient.put(`/api/admin/users/${userId}/status`, { status });
};

// 4. Créditer le solde de jetons d'un revendeur
export const creditResellerBalanceAPI = async (resellerId: string, amount: number): Promise<void> => {
  // Le backend attend un montant positif pour créditer.
  if (amount <= 0) {
    throw new Error("Le montant à créditer doit être positif.");
  }
  await apiClient.put(`/api/resellers/${resellerId}/credit`, { amount });
};