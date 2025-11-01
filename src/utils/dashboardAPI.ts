// src/utils/dashboardAPI.ts

import apiClient from '../services/apiClient';
import { Ticket } from './drawsAPI';

// ====================================================================
// ===== SECTION 1: FONCTIONS POUR LE DASHBOARD JOUEUR (Nouvelles) ======
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

/**
 * [PUBLIC] Récupère la liste de tous les opérateurs de jeu.
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
 */
export const getMyTickets = async (): Promise<Ticket[]> => {
  const response = await apiClient.get<Ticket[]>('/api/tickets/me');
  return response.data;
};


// ============================================================================
// ===== SECTION 2: FONCTIONS POUR LE PANEL ADMIN (Originales et Restaurées) ====
// ============================================================================

// Définit les types de filtres de période que le composant peut utiliser.
export type DashboardPeriod = 'day' | 'week' | 'month' | 'year';
export type RiskTimePeriod = '1h' | 'today' | 'week' | 'all';

// --- Interfaces décrivant la structure des données reçues de l'API ---

// Pour les 4 cartes de statistiques (KPIs)
export interface KpiStats {
  totalRevenue: number;
  revenueTrend: number;
  totalWinnings: number;
  winningsTrend: number;
  totalProfit: number;
  profitTrend: number;
  newPlayers: number;
  newPlayersTrend: number;
}

// Pour chaque point de donnée du graphique des revenus
export interface RevenueDataPoint {
  day: string;
  amount: number;
}

// Pour chaque part du graphique circulaire des jeux
export interface GameDataPoint {
  name: string;
  value: number; // en pourcentage
  color: string;
}

// Pour chaque ligne du tableau des combinaisons à risque
export interface CombinationStat {
  combination: number[];
  operatorName: string;
  count: number;
  totalAmount: number;
  potentialPayout: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

// Pour les cartes de résumé de la section "Analyse de Risque"
export interface RiskSummary {
  totalCombinations: number;
  totalAtRisk: number;
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  maxPotentialPayout: number;
}

// L'interface principale qui rassemble toutes les autres.
// C'est la structure complète de la réponse JSON de l'API.
export interface DashboardData {
  kpis: KpiStats;
  revenueLast7Days: RevenueDataPoint[];
  popularGames: GameDataPoint[];
  riskAnalysis: {
    summary: RiskSummary;
    combinations: CombinationStat[];
  };
}

/**
 * Récupère toutes les données consolidées pour le Dashboard Admin depuis l'API.
 * @param period - La période de temps ('day', 'week', 'month', 'year') pour filtrer les données.
 */
export const getDashboardSummary = async (period: DashboardPeriod): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardData>('/api/admin/dashboard-summary', {
    params: { period }, // Envoie `?period=valeur` à l'API
  });
  return response.data;
};