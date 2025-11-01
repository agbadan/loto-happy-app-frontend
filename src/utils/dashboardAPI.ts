import apiClient from '../services/apiClient';

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