// src/utils/drawsAPI.ts

import apiClient from '../services/apiClient';

// ====================================================================
// ===== INTERFACES (Confirmées 100% conformes au backend) ==========
// ====================================================================

export type Multipliers = Record<string, number>;

export interface Draw {
  id: string;
  operatorName: string;
  operatorId: string;
  drawDate: string; // Format ISO 8601 (ex: "2024-11-05T20:00:00Z")
  status: 'upcoming' | 'completed' | 'archived' | 'cancelled';
  winningNumbers: number[] | null;
}

// L'interface pour la réponse paginée de l'API
export interface PaginatedDraws {
  total: number;
  items: Draw[];
}

export interface Ticket {
  id: string;
  userId: string;
  username: string;
  drawId: string;
  betType: string;
  numbers: string;
  betAmount: number;
  purchaseDate: string;
  status: 'pending' | 'won' | 'lost';
  winAmount?: number | null;
}

export interface BetHistoryItem extends Ticket {
  operatorName: string;
  drawDate: string;
  winningNumbers?: number[] | null;
}

export interface WinNotification {
  id: string;
  userId: string;
  drawId: string;
  operatorName: string;
  drawDate: string;
  winningNumbers: number[];
  playerNumbers: string;
  winAmount: number;
  timestamp: string;
  read: boolean;
}


// ====================================================================
// ===== FONCTIONS POUR L'INTERFACE JOUEUR (Inchangées) =============
// ====================================================================

export const getUpcomingDraws = async (): Promise<Draw[]> => {
  const response = await apiClient.get<Draw[]>('/api/draws/upcoming');
  return response.data;
};

export const getCompletedDraws = async (): Promise<Draw[]> => {
  const response = await apiClient.get<Draw[]>('/api/draws/completed');
  return response.data;
};

export const getDrawById = async (drawId: string): Promise<Draw> => {
  const response = await apiClient.get<Draw>(`/api/draws/${drawId}`);
  return response.data;
};

export const createTicket = async (ticketData: { drawId: string; betType: string; numbers: string; betAmount: number; }): Promise<{ ticket: Ticket }> => {
  const response = await apiClient.post<{ ticket: Ticket }>('/api/tickets', ticketData);
  return { ticket: response.data.ticket };
};

export const getBetHistory = async (): Promise<BetHistoryItem[]> => {
  const response = await apiClient.get<BetHistoryItem[]>('/api/tickets/me');
  return response.data;
};

export const getUserNotifications = async (): Promise<WinNotification[]> => {
  console.warn("La fonction getUserNotifications n'est pas encore implémentée.");
  return [];
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await apiClient.put(`/api/notifications/${notificationId}/read`);
};


// =====================================================================
// ===== FONCTIONS POUR LE PANEL ADMIN (Finalisées et Corrigées) ====
// =====================================================================

type AdminDrawStatus = 'upcoming' | 'completed' | 'archived' | 'cancelled';

/**
 * 1. [ADMIN] Récupère une liste de tirages filtrée par statut.
 */
export const getAdminDrawsByStatus = async (status: AdminDrawStatus): Promise<Draw[]> => {
  // CORRECTION : On utilise l'interface PaginatedDraws pour typer la réponse
  const response = await apiClient.get<PaginatedDraws>('/api/admin/draws', {
    params: { status },
  });
  // La logique reste la même : on retourne bien le tableau `items`
  return response.data.items;
};

/**
 * 2. [ADMIN] Crée un nouveau tirage.
 */
export const createAdminDraw = async (drawData: { operatorId: string; date: string; time: string; multipliers: Multipliers }): Promise<Draw> => {
  const { operatorId, date, time, multipliers } = drawData;
  // CORRECTION : On construit le payload manuellement pour être sûr du format attendu par le backend.
  const payload = {
    operatorId: operatorId,
    drawDate: `${date}T${time}:00Z`, // On combine date et heure en format ISO 8601
    multipliers: multipliers,
  };
  // CORRECTION : L'endpoint admin correct est '/api/admin/draws'
  const response = await apiClient.post<Draw>('/api/admin/draws', payload);
  return response.data;
};

/**
 * 3. [ADMIN] Saisit les numéros gagnants pour un tirage et publie les résultats.
 */
export const publishDrawResults = async (drawId: string, winningNumbers: number[]): Promise<any> => {
  // CORRECTION : L'endpoint admin correct est '/api/admin/draws/{id}/publish-results' avec la méthode POST
  const response = await apiClient.post(`/api/admin/draws/${drawId}/publish-results`, { winningNumbers });
  return response.data;
};

/**
 * 4. [ADMIN] Annule ou archive un tirage.
 */
export const updateAdminDrawStatus = async (drawId: string, status: 'cancelled' | 'archived'): Promise<Draw> => {
  // CORRECTION : L'endpoint admin correct est '/api/admin/draws/{id}/status'
  const response = await apiClient.patch<Draw>(`/api/admin/draws/${drawId}/status`, { status });
  return response.data;
};