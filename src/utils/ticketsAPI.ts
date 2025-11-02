// src/utils/ticketsAPI.ts

// --- CORRECTION MAJEURE DE L'IMPORT ---
// On importe l'objet 'api' depuis le bon client dans le dossier 'services'
import { api } from '../services/apiClient';

// Les interfaces restent les mêmes, elles correspondent à ce que le backend envoie
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
 * Récupère l'historique des tickets de l'utilisateur authentifié
 * en utilisant le client API central de l'application.
 */
export const getPlayerTickets = async (): Promise<Ticket[]> => {
  console.log('[DEBUG] ticketsAPI.ts: Lancement de getPlayerTickets avec le client de /services...');
  
  try {
    // --- CORRECTION DE L'APPEL ---
    // On utilise api.get() qui vient de votre fichier apiClient.ts
    const data = await api.get<Ticket[]>('/api/tickets/me');
    
    console.log('[DEBUG] ticketsAPI.ts: Données reçues avec succès via api.get():', data);
    
    // Vérification de sécurité
    if (!Array.isArray(data)) {
        console.error('[ERREUR] ticketsAPI.ts: La réponse de l\'API n\'est pas un tableau !', data);
        throw new Error("Format de données invalide reçu de l'API.");
    }
    
    // Trier les tickets par date de création
    const sortedData = data.sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log('[DEBUG] ticketsAPI.ts: Données triées prêtes à être renvoyées:', sortedData);
    return sortedData;

  } catch (error) {
    console.error('[ERREUR] ticketsAPI.ts: Échec de l\'appel API via api.get().', error);
    // On propage l'erreur pour que le composant BetHistory puisse l'afficher
    throw error; 
  }
};