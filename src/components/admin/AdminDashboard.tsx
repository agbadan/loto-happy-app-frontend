import { Card } from "../ui/card";
import { TrendingUp, TrendingDown, Users, Trophy, AlertTriangle, TrendingUp as TrendUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState, useEffect } from "react";
import { getCombinationStats, getRiskSummary, TimePeriod, CombinationStat, getDashboardStats, getLast7DaysRevenue, getOperatorStats } from "../../utils/draws";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";

export function AdminDashboard() {
  // États pour les filtres des combinaisons
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [combinationStats, setCombinationStats] = useState<CombinationStat[]>([]);
  const [dashboardStats, setDashboardStats] = useState<ReturnType<typeof getDashboardStats> | null>(null);
  const [revenueData, setRevenueData] = useState<{ day: string; amount: number }[]>([]);
  const [gamesData, setGamesData] = useState<{ name: string; value: number; color: string }[]>([]);
  
  // Fonction pour recharger les données
  const loadDashboardData = () => {
    const stats = getCombinationStats(timePeriod);
    setCombinationStats(stats.slice(0, 10));
    
    const dashStats = getDashboardStats('today');
    setDashboardStats(dashStats);
    
    const revenue7Days = getLast7DaysRevenue();
    setRevenueData(revenue7Days);
    
    const operatorStats = getOperatorStats();
    setGamesData(operatorStats);
  };
  
  // Charger les statistiques
  useEffect(() => {
    loadDashboardData();
  }, [timePeriod]);
  
  // Rafraîchir automatiquement toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData();
    }, 10000); // 10 secondes
    
    return () => clearInterval(interval);
  }, [timePeriod]);
  
  // Obtenir le résumé des risques
  const riskSummary = getRiskSummary(timePeriod);
  
  // KPIs dynamiques basés sur les vraies données
  const kpis = dashboardStats ? [
    {
      title: "Chiffre d'Affaires du Jour",
      value: `${dashboardStats.totalRevenue.toLocaleString('fr-FR')} F`,
      icon: TrendingUp,
      color: "#FFD700",
      trend: "+12.5%",
    },
    {
      title: "Gains Payés du Jour",
      value: `${dashboardStats.totalWinnings.toLocaleString('fr-FR')} F`,
      icon: TrendingDown,
      color: "#FF6B00",
      trend: "-8.2%",
    },
    {
      title: "Bénéfice Brut du Jour",
      value: `${dashboardStats.totalProfit.toLocaleString('fr-FR')} F`,
      icon: Trophy,
      color: "#4F00BC",
      trend: dashboardStats.totalProfit > 0 ? `+${((dashboardStats.totalProfit / (dashboardStats.totalRevenue || 1)) * 100).toFixed(1)}%` : "0%",
    },
    {
      title: "Nouveaux Joueurs",
      value: dashboardStats.newPlayers.toString(),
      icon: Users,
      color: "#00C853",
      trend: `+${dashboardStats.newPlayers}`,
    },
  ] : [];
  
  // Fonction pour obtenir la couleur du badge de risque
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      default: return 'bg-green-500/20 text-green-500 border-green-500/30';
    }
  };
  
  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'critical': return 'CRITIQUE';
      case 'high': return 'ÉLEVÉ';
      case 'medium': return 'MOYEN';
      default: return 'FAIBLE';
    }
  };
  
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
          Tableau de Bord
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
          Vue d'ensemble de l'activité de la plateforme
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="p-3 sm:p-4 md:p-6 border-border hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 line-clamp-2">
                    {kpi.title}
                  </p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground break-words">
                    {kpi.value}
                  </p>
                  <p className="text-xs sm:text-sm mt-1 sm:mt-2" style={{ color: kpi.color }}>
                    {kpi.trend}
                  </p>
                </div>
                <div className="p-1.5 sm:p-2 md:p-3 rounded-lg flex-shrink-0" style={{ backgroundColor: `${kpi.color}20` }}>
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" style={{ color: kpi.color }} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Graphique en barres */}
        <Card className="p-4 md:p-6 border-border">
          <h3 className="text-base md:text-lg font-bold text-foreground mb-4">Revenus des 7 derniers jours</h3>
          <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" style={{ fontSize: '12px' }} />
              <YAxis stroke="#888" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #333', fontSize: '12px' }}
                formatter={(value: number) => `${(value / 1000).toFixed(0)}K F`}
              />
              <Bar dataKey="amount" fill="#FFD700" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Graphique circulaire */}
        <Card className="p-4 md:p-6 border-border">
          <h3 className="text-base md:text-lg font-bold text-foreground mb-4">Jeux les plus populaires</h3>
          <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
            <PieChart>
              <Pie
                data={gamesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                style={{ fontSize: '11px' }}
              >
                {gamesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #333', fontSize: '12px' }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Statistiques des Combinaisons - SECTION CRITIQUE POUR LA GESTION DES RISQUES */}
      <Card className="p-4 md:p-6 border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-foreground">
                Combinaisons à Surveiller
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Suivi en temps réel des combinaisons les plus jouées
              </p>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap gap-2">
            <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
              <SelectTrigger className="w-[140px] bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Dernière heure</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Résumé des risques */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-3 rounded-lg border border-border bg-background/50">
            <p className="text-xs text-muted-foreground mb-1">Total combinaisons</p>
            <p className="text-lg font-bold text-foreground">{riskSummary.totalCombinations}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-background/50">
            <p className="text-xs text-muted-foreground mb-1">Mises totales</p>
            <p className="text-lg font-bold text-foreground">
              {(riskSummary.totalAtRisk / 1000).toFixed(0)}K F
            </p>
          </div>
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10">
            <p className="text-xs text-red-400 mb-1">Risque critique</p>
            <p className="text-lg font-bold text-red-500">{riskSummary.criticalRisk}</p>
          </div>
          <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/10">
            <p className="text-xs text-orange-400 mb-1">Risque élevé</p>
            <p className="text-lg font-bold text-orange-500">{riskSummary.highRisk}</p>
          </div>
          <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
            <p className="text-xs text-yellow-400 mb-1">Risque moyen</p>
            <p className="text-lg font-bold text-yellow-500">{riskSummary.mediumRisk}</p>
          </div>
          <div className="p-3 rounded-lg border border-border bg-background/50">
            <p className="text-xs text-muted-foreground mb-1">Gain potentiel max</p>
            <p className="text-lg font-bold text-[#FFD700]">
              {(riskSummary.maxPotentialPayout / 1000000).toFixed(1)}M F
            </p>
          </div>
        </div>

        {/* Tableau des combinaisons */}
        {combinationStats.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Aucune combinaison jouée pour la période sélectionnée
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-visible">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-xs sm:text-sm text-muted-foreground font-medium">
                    Rang
                  </th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm text-muted-foreground font-medium">
                    Combinaison
                  </th>
                  <th className="text-left py-3 px-2 text-xs sm:text-sm text-muted-foreground font-medium">
                    Jeu
                  </th>
                  <th className="text-center py-3 px-2 text-xs sm:text-sm text-muted-foreground font-medium">
                    Fois jouée
                  </th>
                  <th className="text-right py-3 px-2 text-xs sm:text-sm text-muted-foreground font-medium">
                    Mise totale
                  </th>
                  <th className="text-right py-3 px-2 text-xs sm:text-sm text-muted-foreground font-medium">
                    Gain potentiel
                  </th>
                  <th className="text-center py-3 px-2 text-xs sm:text-sm text-muted-foreground font-medium">
                    Risque
                  </th>
                </tr>
              </thead>
              <tbody>
                {combinationStats.map((stat, index) => (
                  <tr 
                    key={`${stat.operatorId}_${stat.combinationStr}_${index}`}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-2">
                      <span className="text-sm font-medium text-foreground">#{index + 1}</span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1">
                        {stat.combination.map((num) => (
                          <span
                            key={num}
                            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF6B00] text-white text-xs font-bold shadow-sm"
                          >
                            {num}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-foreground">{stat.operatorName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
                        {stat.count}×
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm font-medium text-foreground">
                        {stat.totalAmount.toLocaleString()} F
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <span className="text-sm font-bold text-[#FFD700]">
                        {(stat.potentialPayout / 1000).toFixed(0)}K F
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium border ${getRiskColor(stat.riskLevel)}`}
                      >
                        {getRiskLabel(stat.riskLevel)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Note explicative */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">💡 Note:</strong> Cette section affiche les combinaisons qui sont le plus jouées 
            sur les tirages à venir. Le "Gain potentiel" représente le montant total que vous devrez payer si cette combinaison 
            gagne. Préparez vos caisses en conséquence pour les combinaisons à risque élevé.
          </p>
        </div>
      </Card>
    </div>
  );
}