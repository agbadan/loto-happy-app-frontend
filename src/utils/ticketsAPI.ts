// src/utils/ticketsAPI.ts

import apiClient from './apiClient'; // <-- CORRECTION: Importe depuis apiClient.ts

// Définir les types pour correspondre à la réponse du backend
export interface TicketDraw {
  id: string;
  date: string;
  time: string;
  winningNumbers: string | null;
}

export interface Ticket {
  id: string;
  betType: string;
  numbers: string;
  betAmount: number;
  status: 'PENDING' | 'WON' | 'LOST';
  winnings: number | null;
  createdAt: string;
  draw: TicketDraw;
}

/**
 * Récupère l'historique des tickets de l'utilisateur authentifié.
 */
export const getPlayerTickets = async (): Promise<Ticket[]> => {
  try {
    // <-- CORRECTION: Utilise apiClient au lieu de api
    const data = await apiClient.get<Ticket[]>('/api/tickets/me');
    
    // Trier les tickets par date de création, du plus récent au plus ancien
    return data.sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique des paris:", error);
    throw new Error("Impossible de charger l'historique des paris.");
  }
};