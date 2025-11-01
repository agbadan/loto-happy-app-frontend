import apiClient from '../services/apiClient';

// Types pour les données du dashboard, basés sur la structure demandée au backend
export type TimePeriod = '1h' | 'today' | 'week' | 'all';

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

export interface RevenueDataPoint {
  day: string;
  amount: number;
}

export interface GameDataPoint {
  name: string;
  value: number; // en pourcentage
  color: string;
}

export interface CombinationStat {
  combination: number[];
  operatorName: string;
  count: number;
  totalAmount: number;
  potentialPayout: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

export interface RiskSummary {
  totalCombinations: number;
  totalAtRisk: number;
  criticalRisk: number;
  highRisk: number;
  mediumRisk: number;
  maxPotentialPayout: number;
}

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
 * Récupère toutes les données du dashboard depuis l'API.
 * @param period - La période de temps pour filtrer les combinaisons à risque.
 */
export const getDashboardSummary = async (period: TimePeriod): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardData>('/api/admin/dashboard-summary', {
    params: { period },
  });
  return response.data;
};