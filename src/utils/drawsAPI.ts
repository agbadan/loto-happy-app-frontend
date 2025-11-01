// src/utils/drawsAPI.ts

import apiClient from '../services/apiClient';

// ====================================================================
// ===== INTERFACES (Finalisées pour le contrat backend) ==============
// ====================================================================

export type Multipliers = Record<string, number>;

// CORRECTION FINALE: L'interface utilise les noms de champs en camelCase 
// confirmés par le backend. J'ai rajouté operatorId qui n'est pas dans la réponse 
// mais est nécessaire au frontend, le backend devra peut-être l'ajouter.
export interface Draw {
  id: string;
  operatorName: string;
  drawDate: string; // Contient la date ET l'heure au format ISO
  status: 'upcoming' | 'completed' | 'archived' | 'cancelled';
  winningNumbers: number[] | null;
  // Ce champ est essentiel pour le frontend afin de mapper le tirage à un opérateur local (pour l'icône, etc.)
  // Le backend devra peut-être ajouter ce champ à sa réponse.
  operatorId: string; 
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
 */
export const getAdminDrawsByStatus = async (status: AdminDrawStatus): Promise<Draw[]> => {
  const response = await apiClient.get<{ items: Draw[] }>('/api/admin/draws', {
    params: { status },
  });
  return response.data.items;
};

/**
 * 2. [ADMIN] Crée un nouveau tirage.
 */
export const createAdminDraw = async (drawData: { operatorId: string; date: string; time: string; multipliers: Multipliers }): Promise<Draw> => {
  const response = await apiClient.post<Draw>('/api/draws/', drawData);
  return response.data;
};

/**
 * 3. [ADMIN] Saisit les numéros gagnants pour un tirage.
 */
export const publishDrawResults = async (drawId: string, winningNumbers: number[]): Promise<any> => {
  const response = await apiClient.put(`/api/draws/${drawId}/results`, { winningNumbers });
  return response.data;
};

/**
 * 4. [ADMIN] Annule ou archive un tirage.
 */
export const updateAdminDrawStatus = async (drawId: string, status: 'cancelled' | 'archived'): Promise<Draw> => {
  const response = await apiClient.patch<Draw>(`/api/admin/draws/${drawId}/status`, { status });
  return response.data;
};