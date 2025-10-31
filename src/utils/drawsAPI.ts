// src/utils/drawsAPI.ts

// On importe uniquement notre client Axios centralisé.
import apiClient from '../services/apiClient';

// ===== INTERFACES =====
// Ces interfaces décrivent les objets que nous attendons de notre backend.

export interface Draw {
  id: string;
  operatorId: string;
  operatorName: string; // Le backend /upcoming renvoie déjà ces champs
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

// C'est l'interface enrichie renvoyée par /api/tickets/me
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

/**
 * Récupère les tirages à venir pour l'affichage principal.
 */
export const getUpcomingDraws = async (): Promise<Draw[]> => {
  const response = await apiClient.get<Draw[]>('/api/draws/upcoming');
  return response.data;
};

/**
 * Récupère les tirages terminés (les résultats).
 */
export const getCompletedDraws = async (): Promise<Draw[]> => {
  const response = await apiClient.get<Draw[]>('/api/draws/completed');
  return response.data;
};

/**
 * Crée un nouveau tirage (action réservée aux admins).
 */
export const createDraw = async (drawData: {
  operatorId: string;
  date: string;
  time: string;
}): Promise<Draw> => {
  const response = await apiClient.post<Draw>('/api/draws', drawData);
  return response.data;
};

/**
 * Publie les résultats d'un tirage (action réservée aux admins).
 */
export const publishDrawResults = async (
  drawId: string,
  winningNumbers: number[]
): Promise<any> => {
  const response = await apiClient.put(`/api/draws/${drawId}/results`, {
    winningNumbers, // Le backend attend 'winningNumbers' en camelCase
  });
  return response.data;
};


// ===== GESTION DES PARIS (TICKETS) =====

/**
 * Permet à un joueur d'acheter un nouveau ticket.
 */
export const createTicket = async (ticketData: {
  drawId: string;
  betType: string;
  numbers: string;
  betAmount: number;
}): Promise<{ ticket: Ticket; newBalance: number }> => {
  // Le backend ne renvoie pas le 'newBalance', on va l'ignorer pour l'instant.
  // Le AuthContext se chargera de rafraîchir les données de l'utilisateur.
  const response = await apiClient.post<{ ticket: Ticket }>('/api/tickets', ticketData);
  return { ticket: response.data.ticket, newBalance: 0 }; // newBalance est un placeholder
};


/**
 * Récupère l'historique complet et enrichi des paris de l'utilisateur connecté.
 */
export const getBetHistory = async (): Promise<BetHistoryItem[]> => {
  const response = await apiClient.get<BetHistoryItem[]>('/api/tickets/me');
  return response.data;
};


// ===== NOTIFICATIONS DE GAINS =====

/**
 * Récupère les notifications de l'utilisateur connecté.
 */
export const getUserNotifications = async (): Promise<WinNotification[]> => {
  // Le backend n'a pas encore de route '/me' pour les notifications,
  // on va construire cette logique plus tard si nécessaire.
  // Pour l'instant, cette fonction est un placeholder.
  console.warn("La fonction getUserNotifications n'est pas encore implémentée.");
  return []; // Retourne un tableau vide pour éviter les erreurs.
  // const response = await apiClient.get<WinNotification[]>('/api/notifications/me');
  // return response.data;
};

/**
 * Marque une notification comme lue.
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  await apiClient.put(`/api/notifications/${notificationId}/read`);
};