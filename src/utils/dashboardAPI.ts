// src/utils/dashboardAPI.ts

import apiClient from '../services/apiClient';

// ====================================================================
// ===== INTERFACES SPÉCIFIQUES AU DASHBOARD ==========================
// ====================================================================

export interface Operator {
  id: string;
  name: string;
  icon: string;
  country: string;
  color: string;
}

export interface Winner {
  playerName: string;
  winAmount: number;
  gameName: string;
  winDate: string; // Chaîne de caractères au format ISO 8601
}

// L'interface Ticket de drawsAPI.ts est plus complète, nous la réutilisons.
// Si elle n'était pas exportée, on la redéfinirait ici.
import { Ticket } from './drawsAPI';


// ====================================================================
// ===== NOUVELLES FONCTIONS API POUR LE DASHBOARD ====================
// ====================================================================

/**
 * [PUBLIC] Récupère la liste de tous les opérateurs de jeu avec leurs métadonnées.
 */
export const getOperators = async (): Promise<Operator[]> => {
  const response = await apiClient.get<Operator[]>('/api/operators');
  return response.data;
};

/**
 * [PUBLIC] Récupère la liste des gagnants récents pour le fil d'actualité.
 */
export const getWinnerFeed = async (): Promise<Winner[]> => {
  const response = await apiClient.get<Winner[]>('/api/public/winner-feed');
  return response.data;
};

/**
 * [AUTH] Récupère l'historique de tous les tickets pour l'utilisateur connecté.
 * Identique à getBetHistory, mais on la garde ici pour la logique de notification.
 */
export const getMyTickets = async (): Promise<Ticket[]> => {
  const response = await apiClient.get<Ticket[]>('/api/tickets/me');
  return response.data;
};