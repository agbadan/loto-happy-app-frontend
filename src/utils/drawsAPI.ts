// src/utils/drawsAPI.ts

import apiClient from '../services/apiClient';

// ===== INTERFACES =====
export interface Draw {
  id: string;
  operatorId: string;
  operatorName: string;
  operatorIcon: string;
  date: string;
  time: string;
  status: 'upcoming' | 'pending' | 'completed';
  multipliers: Record<string, number>;
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

// ===== GESTION DES TIRAGES (DRAWS) =====

export const getUpcomingDraws = async (): Promise<Draw[]> => {
  const response = await apiClient.get<Draw[]>('/api/draws/upcoming');
  return response.data;
};

export const getCompletedDraws = async (): Promise<Draw[]> => {
  const response = await apiClient.get<Draw[]>('/api/draws/completed');
  return response.data;
};

// --- FONCTION RÉ-AJOUTÉE ---
export const getDrawById = async (drawId: string): Promise<Draw> => {
  const response = await apiClient.get<Draw>(`/api/draws/${drawId}`);
  return response.data;
};

export const createDraw = async (drawData: { operatorId: string; date: string; time: string; }): Promise<Draw> => {
  const response = await apiClient.post<Draw>('/api/draws', drawData);
  return response.data;
};

export const publishDrawResults = async (drawId: string, winningNumbers: number[]): Promise<any> => {
  const response = await apiClient.put(`/api/draws/${drawId}/results`, { winningNumbers });
  return response.data;
};


// ===== GESTION DES PARIS (TICKETS) =====

export const createTicket = async (ticketData: { drawId: string; betType: string; numbers: string; betAmount: number; }): Promise<{ ticket: Ticket }> => {
  const response = await apiClient.post<{ ticket: Ticket }>('/api/tickets', ticketData);
  return { ticket: response.data.ticket };
};

export const getBetHistory = async (): Promise<BetHistoryItem[]> => {
  const response = await apiClient.get<BetHistoryItem[]>('/api/tickets/me');
  return response.data;
};


// ===== NOTIFICATIONS DE GAINS =====

export const getUserNotifications = async (): Promise<WinNotification[]> => {
  console.warn("La fonction getUserNotifications n'est pas encore implémentée.");
  return [];
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await apiClient.put(`/api/notifications/${notificationId}/read`);
};