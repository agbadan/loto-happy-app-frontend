// src/utils/ticketsAPI.ts

// --- L'IMPORT LE PLUS IMPORTANT ---
// Il importe le VRAI client axios depuis le fichier que vous venez de me montrer.
// Assurez-vous que le chemin est correct. S'ils sont dans le même dossier, c'est './apiClient'.
import apiClient from '../services/apiClient';

// Les interfaces sont correctes et correspondent à la réponse réseau que vous avez capturée.
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
    // On utilise le vrai apiClient. On attend la réponse complète.
    const response = await apiClient.get<Ticket[]>('/api/tickets/me');
    
    // On extrait les données de la propriété 'data' de la réponse axios.
    const data = response.data;
    
    if (!Array.isArray(data)) {
        console.error('API Error: Expected an array of tickets, but received:', data);
        throw new Error("Format de données invalide reçu de l'API.");
    }
    
    // Trier les tickets par date de création, du plus récent au plus ancien
    const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return sortedData;

  } catch (error) {
    console.error("Erreur critique dans getPlayerTickets:", error);
    // On propage l'erreur pour que BetHistory puisse l'afficher à l'utilisateur.
    throw error;
  }
};