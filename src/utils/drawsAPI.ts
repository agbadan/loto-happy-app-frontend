// src/utils/drawsAPI.ts

import apiClient from '../services/apiClient';

// ====================================================================
// ===== INTERFACES (Conservées et Mises à Jour) ======================
// ====================================================================

export type Multipliers = Record<string, number>;

export interface Draw {
  id: string;
  operatorId: string;
  operatorName: string;
  operatorIcon: string;
  date: string;
  time: string;
  status: 'upcoming' | 'pending' | 'completed' | 'cancelled' | 'archived';
  multipliers: Multipliers;
  participants: number;
  winningNumbers?: number[];
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
  drawTime: string;
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
// ===== FONCTIONS POUR L'INTERFACE JOUEUR (Conservées) =============
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
// ===== FONCTIONS POUR LE PANEL ADMIN (Corrigées selon le contrat) ====
// =====================================================================

type AdminDrawStatus = 'upcoming' | 'completed' | 'archived' | 'cancelled';

/**
 * 1. [ADMIN] Récupère une liste de tirages filtrée par statut.
 * Conforme au contrat: GET /api/admin/draws?status=...
 */
export const getAdminDrawsByStatus = async (status: AdminDrawStatus): Promise<Draw[]> => {
  // CORRECTION: On spécifie que le type de la réponse attendue est un objet contenant une clé "items"
  // qui est un tableau de Draw.
  const response = await apiClient.get<{ items: Draw[] }>('/api/admin/draws', {
    params: { status },
  });
  // CORRECTION: On retourne la propriété `items` de la réponse, qui est le tableau,
  // et non l'objet de réponse entier.
  return response.data.items;
};

/**
 * 2. [ADMIN] Crée un nouveau tirage.
 * Conforme au contrat: POST /api/draws
 */
export const createAdminDraw = async (drawData: { operatorId: string; date: string; time: string; multipliers: Multipliers }): Promise<Draw> => {
  const response = await apiClient.post<Draw>('/api/draws', drawData);
  return response.data;
};

/**
 * 3. [ADMIN] Saisit les numéros gagnants pour un tirage.
 * Conforme au contrat: PUT /api/draws/{draw_id}/results
 */
export const publishDrawResults = async (drawId: string, winningNumbers: number[]): Promise<any> => {
  const response = await apiClient.put(`/api/draws/${drawId}/results`, { winningNumbers });
  return response.data;
};

/**
 * 4. [ADMIN] Annule ou archive un tirage.
 * Conforme au contrat: PATCH /api/admin/draws/{draw_id}/status
 */
export const updateAdminDrawStatus = async (drawId: string, status: 'cancelled' | 'archived'): Promise<Draw> => {
  const response = await apiClient.patch<Draw>(`/api/admin/draws/${drawId}/status`, { status });
  return response.data;
};