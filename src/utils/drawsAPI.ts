/**
 * NOUVEAU SYSTÈME DE GESTION DES TIRAGES ET PARIS - API Backend
 * Remplace l'ancien système localStorage
 */

import api, { ApiError, DEV_MODE } from './apiClient';
import { refreshUserData } from './authAPI';
// Import de l'ancien système pour fallback
import * as oldDraws from './draws';

// ===== INTERFACES =====

export interface Draw {
  id: string;
  operatorId: string;
  date: string; // Format: "2025-10-30"
  time: string; // Format: "18:00"
  status: 'upcoming' | 'pending' | 'completed';
  multipliers: {
    NAP1?: number;
    NAP2?: number;
    NAP3?: number;
    NAP4?: number;
    NAP5?: number;
    PERMUTATION?: number;
    BANKA?: number;
    CHANCE_PLUS?: number;
    ANAGRAMME?: number;
  };
  winningNumbers: number[];
  createdAt: string;
  createdBy: string;
}

export interface Ticket {
  id: string;
  userId: string;
  username: string;
  drawId: string;
  betType: 'NAP1' | 'NAP2' | 'NAP3' | 'NAP4' | 'NAP5' | 
           'PERMUTATION' | 'BANKA' | 'CHANCE_PLUS' | 'ANAGRAMME';
  numbers: string; // Ex: "12, 34, 56"
  betAmount: number;
  purchaseDate: string;
  status: 'pending' | 'won' | 'lost';
  winAmount?: number;
  
  // Champs spécifiques aux types de paris
  baseNumber?: number; // Pour BANKA
  associatedNumbers?: number[]; // Pour BANKA
  position?: 'first' | 'last'; // Pour CHANCE_PLUS
  combinations?: number[][]; // Pour PERMUTATION
}

export interface BetHistoryItem {
  id: string;
  drawId: string;
  operatorName: string;
  numbers: string;
  betAmount: number;
  purchaseDate: string;
  drawDate: string;
  drawTime: string;
  status: 'upcoming' | 'pending' | 'won' | 'lost';
  winAmount?: number;
  winningNumbers?: number[];
  betType?: string;
}

export interface WinNotification {
  id: string;
  userId: string;
  drawId: string;
  operatorName: string;
  drawDate: string;
  winningNumbers: number[];
  playerNumbers: string;
  matchCount: number;
  winAmount: number;
  timestamp: string;
  read: boolean;
}

// ===== GESTION DES TIRAGES =====

/**
 * Récupérer tous les tirages
 */
export async function getDraws(): Promise<Draw[]> {
  try {
    return await api.get<Draw[]>('/api/draws');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des tirages');
  }
}

/**
 * Récupérer un tirage par ID
 */
export async function getDrawById(drawId: string): Promise<Draw> {
  try {
    return await api.get<Draw>(`/api/draws/${drawId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération du tirage');
  }
}

/**
 * Récupérer les tirages à venir
 */
export async function getUpcomingDraws(): Promise<Draw[]> {
  try {
    return await api.get<Draw[]>('/api/draws/upcoming');
  } catch (error) {
    // FALLBACK: Si erreur réseau, utiliser l'ancien système localStorage
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR' && DEV_MODE.useLocalStorageFallback) {
      console.warn('⚠️ Backend non accessible pour getUpcomingDraws, utilisation localStorage');
      oldDraws.updateDrawStatuses(); // Mettre à jour les statuts
      return oldDraws.getDraws() as any; // Conversion de type
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des tirages à venir');
  }
}

/**
 * Récupérer les tirages en attente de résultats
 */
export async function getPendingDraws(): Promise<Draw[]> {
  try {
    return await api.get<Draw[]>('/api/draws/pending');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des tirages en attente');
  }
}

/**
 * Récupérer les tirages terminés
 */
export async function getCompletedDraws(): Promise<Draw[]> {
  try {
    return await api.get<Draw[]>('/api/draws/completed');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des tirages terminés');
  }
}

/**
 * Créer un nouveau tirage (admin)
 */
export async function createDraw(drawData: {
  operatorId: string;
  date: string;
  time: string;
  multipliers: Record<string, number>;
}): Promise<Draw> {
  try {
    return await api.post<Draw>('/api/draws', drawData);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la création du tirage');
  }
}

/**
 * Modifier un tirage (admin)
 */
export async function updateDraw(
  drawId: string,
  updates: Partial<Draw>
): Promise<Draw> {
  try {
    return await api.put<Draw>(`/api/draws/${drawId}`, updates);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la modification du tirage');
  }
}

/**
 * Supprimer un tirage (admin)
 */
export async function deleteDraw(drawId: string): Promise<void> {
  try {
    await api.delete(`/api/draws/${drawId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la suppression du tirage');
  }
}

/**
 * Publier les résultats d'un tirage (admin)
 * Cette fonction déclenche automatiquement le calcul et la distribution des gains
 */
export async function publishDrawResults(
  drawId: string,
  winningNumbers: number[]
): Promise<{
  draw: Draw;
  stats: {
    totalTickets: number;
    totalWinners: number;
    totalWinnings: number;
    totalRevenue: number;
    profit: number;
  };
}> {
  try {
    return await api.put(`/api/draws/${drawId}/results`, {
      winning_numbers: winningNumbers,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la publication des résultats');
  }
}

// ===== GESTION DES PARIS (TICKETS) =====

/**
 * Créer un nouveau pari
 */
export async function createTicket(ticketData: {
  drawId: string;
  betType: string;
  numbers: string;
  betAmount: number;
  baseNumber?: number;
  associatedNumbers?: number[];
  position?: 'first' | 'last';
  combinations?: number[][];
}): Promise<{
  ticket: Ticket;
  newBalance: number;
}> {
  try {
    const result = await api.post<{
      ticket: Ticket;
      new_balance: number;
    }>('/api/tickets', {
      draw_id: ticketData.drawId,
      bet_type: ticketData.betType,
      numbers: ticketData.numbers,
      bet_amount: ticketData.betAmount,
      base_number: ticketData.baseNumber,
      associated_numbers: ticketData.associatedNumbers,
      position: ticketData.position,
      combinations: ticketData.combinations,
    });

    // Rafraîchir les données utilisateur (solde mis à jour)
    await refreshUserData();

    return {
      ticket: result.ticket,
      newBalance: result.new_balance,
    };
  } catch (error) {
    // FALLBACK: Si erreur réseau, utiliser l'ancien système localStorage
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR' && DEV_MODE.useLocalStorageFallback) {
      console.warn('⚠️ Backend non accessible pour createTicket, utilisation localStorage');
      
      // Importer les fonctions nécessaires
      const { getCurrentUser } = await import('./auth');
      const user = getCurrentUser();
      
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }
      
      // Créer le ticket avec l'ancien système
      const ticket = oldDraws.createTicket(
        user.id,
        user.username || user.phoneNumber,
        ticketData.drawId,
        ticketData.numbers,
        ticketData.betAmount,
        ticketData.betType as any,
        {
          betType: ticketData.betType,
          baseNumber: ticketData.baseNumber,
          associatedNumbers: ticketData.associatedNumbers,
          position: ticketData.position,
          combinations: ticketData.combinations,
        }
      );
      
      // Mettre à jour le solde localement
      const { deductBetCost } = await import('./auth');
      deductBetCost(ticketData.betAmount);
      
      // Recharger l'utilisateur
      const updatedUser = getCurrentUser();
      
      return {
        ticket: ticket as any,
        newBalance: updatedUser?.balanceGame || 0,
      };
    }
    
    if (error instanceof ApiError) {
      if (error.code === 'INSUFFICIENT_BALANCE') {
        throw new Error('Solde insuffisant pour effectuer ce pari');
      }
      if (error.code === 'DRAW_CLOSED') {
        throw new Error('Ce tirage est fermé aux nouveaux paris');
      }
      if (error.code === 'INVALID_NUMBERS') {
        throw new Error('Les numéros choisis sont invalides');
      }
      throw error;
    }
    throw new Error('Erreur lors de la création du pari');
  }
}

/**
 * Récupérer les tickets de l'utilisateur connecté
 */
export async function getUserTickets(): Promise<Ticket[]> {
  try {
    return await api.get<Ticket[]>('/api/tickets/me');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération de vos paris');
  }
}

/**
 * Récupérer l'historique des paris de l'utilisateur (enrichi)
 */
export async function getBetHistory(): Promise<BetHistoryItem[]> {
  try {
    return await api.get<BetHistoryItem[]>('/api/tickets/me');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération de l\'historique');
  }
}

/**
 * Récupérer un ticket par ID
 */
export async function getTicketById(ticketId: string): Promise<Ticket> {
  try {
    return await api.get<Ticket>(`/api/tickets/${ticketId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération du ticket');
  }
}

/**
 * Récupérer tous les tickets d'un tirage (admin)
 */
export async function getDrawTickets(drawId: string): Promise<Ticket[]> {
  try {
    return await api.get<Ticket[]>(`/api/tickets/draw/${drawId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des tickets du tirage');
  }
}

/**
 * Supprimer un ticket (admin uniquement, avant le tirage)
 */
export async function deleteTicket(ticketId: string): Promise<void> {
  try {
    await api.delete(`/api/tickets/${ticketId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la suppression du ticket');
  }
}

// ===== NOTIFICATIONS DE GAINS =====

/**
 * Récupérer les notifications de gains de l'utilisateur
 */
export async function getUserNotifications(userId?: string): Promise<WinNotification[]> {
  try {
    const endpoint = userId
      ? `/api/notifications/user/${userId}`
      : '/api/notifications/me';
    
    return await api.get<WinNotification[]>(endpoint);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des notifications');
  }
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await api.put(`/api/notifications/${notificationId}/read`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la mise à jour de la notification');
  }
}

/**
 * Supprimer une notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await api.delete(`/api/notifications/${notificationId}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la suppression de la notification');
  }
}

// ===== STATISTIQUES (ADMIN) =====

/**
 * Récupérer les statistiques du tableau de bord admin
 */
export async function getDashboardStats(period: string = 'today'): Promise<{
  totalRevenue: number;
  totalWinnings: number;
  totalProfit: number;
  newPlayers: number;
  activePlayers: number;
  totalPlayers: number;
  totalBets: number;
  avgBetAmount: number;
}> {
  try {
    return await api.get(`/api/admin/stats/dashboard?period=${period}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des statistiques');
  }
}

/**
 * Récupérer les revenus des derniers jours
 */
export async function getRevenueStats(days: number = 7): Promise<Array<{
  day: string;
  date: string;
  amount: number;
}>> {
  try {
    return await api.get(`/api/admin/stats/revenue?days=${days}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des revenus');
  }
}

/**
 * Récupérer les statistiques par opérateur
 */
export async function getOperatorStats(): Promise<Array<{
  operatorId: string;
  name: string;
  color: string;
  totalBets: number;
  totalRevenue: number;
  percentage: number;
}>> {
  try {
    return await api.get('/api/admin/stats/operators');
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des stats opérateurs');
  }
}

/**
 * Récupérer les combinaisons à risque
 */
export async function getCombinationStats(period: string = 'today', limit: number = 10): Promise<{
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  topRisks: Array<{
    combination: string;
    betCount: number;
    totalStaked: number;
    potentialPayout: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    affectedDraws: string[];
  }>;
}> {
  try {
    return await api.get(`/api/admin/stats/combinations?period=${period}&limit=${limit}`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération des combinaisons à risque');
  }
}
