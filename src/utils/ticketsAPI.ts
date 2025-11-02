// src/utils/ticketsAPI.ts

import apiClient  from './apiClient';

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
  // --- LOG DE DÉBUT ---
  console.log('[DEBUG] ticketsAPI.ts: Lancement de getPlayerTickets...');
  
  try {
    // --- APPEL API ---
    // Correction importante : On récupère l'objet "response" complet d'axios
    const response = await apiClient.get<Ticket[]>('/api/tickets/me');
    
    // --- LOG DE LA RÉPONSE BRUTE ---
    // On log l'objet "response" entier pour voir le statut, les headers, etc.
    console.log('[DEBUG] ticketsAPI.ts: Réponse complète reçue d\'axios:', response);

    // On extrait les données de la propriété "data"
    const data = response.data;
    
    // --- LOG DES DONNÉES EXTRAITES ---
    console.log('[DEBUG] ticketsAPI.ts: Données extraites de response.data:', data);
    
    // --- VÉRIFICATION DE SÉCURITÉ ---
    // On s'assure que les données sont bien un tableau avant de continuer
    if (!Array.isArray(data)) {
        console.error('[ERREUR] ticketsAPI.ts: La réponse de l\'API (response.data) n\'est pas un tableau ! Reçu:', data);
        throw new Error("Format de données invalide reçu de l'API.");
    }
    
    // Trier les tickets par date de création, du plus récent au plus ancien
    const sortedData = data.sort((a: Ticket, b: Ticket) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // --- LOG DU RÉSULTAT FINAL ---
    console.log('[DEBUG] ticketsAPI.ts: Données triées prêtes à être envoyées au composant:', sortedData);

    return sortedData;

  } catch (error) {
    // --- LOG EN CAS D'ERREUR ---
    // Ce bloc s'exécutera si l'appel apiClient.get échoue ou si une erreur est jetée manuellement
    console.error('[ERREUR] ticketsAPI.ts: Échec de l\'appel API ou de la validation des données.', error);
    
    // On propage l'erreur pour que le composant puisse l'afficher
    throw new Error("Impossible de charger l'historique des paris.");
  }
};