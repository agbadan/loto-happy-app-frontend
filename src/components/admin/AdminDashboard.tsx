import { Card } from "../ui/card";
import { TrendingUp, TrendingDown, Users, Trophy, AlertTriangle, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { TimePeriod, DashboardData, getDashboardSummary } from "../../utils/dashboardAPI"; // Import depuis notre nouveau fichier API

export function AdminDashboard() {
  // États pour les données, le chargement et les erreurs
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');

  // Fonction asynchrone pour charger les données depuis l'API
  const loadDashboardData = async (currentPeriod: TimePeriod) => {
    // Ne montrer le spinner que pour le chargement initial, pas pour les rafraîchissements
    if (!dashboardData) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await getDashboardSummary(currentPeriod);
      setDashboardData(data);
    } catch (err) {
      console.error("Erreur lors du chargement du dashboard:", err);
      setError("Impossible de charger les données du tableau de bord. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // useEffect pour charger les données quand la période de temps change
  useEffect(() => {
    loadDashboardData(timePeriod);
  }, [timePeriod]);
  
  // useEffect pour le rafraîchissement automatique
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardData(timePeriod);
    }, 30000); // Rafraîchir toutes les 30 secondes
    
    return () => clearInterval(interval); // Nettoyer l'intervalle
  }, [timePeriod]);
  
  // Fonctions utilitaires pour les badges de risque
  const getRiskColor = (level: string) => ({
      'critical': 'bg-red-500/20 text-red-500 border-red-500/30',
      'high': 'bg-orange-500/20 text-orange-500 border-orange-500/30',
      'medium': 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
    }[level] || 'bg-green-500/20 text-green-500 border-green-500/30');

  const getRiskLabel = (level: string) => ({
      'critical': 'CRITIQUE',
      'high': 'ÉLEVÉ',
      'medium': 'MOYEN',
    }[level] || 'FAIBLE');

  // Affichage de l'état de chargement initial
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-[calc(100vh-100px)]">
        <Loader2 className="h-12 w-12 animate-spin text-foreground" />
      </div>
    );
  }

  // Affichage de l'état d'erreur
  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl text-red-500">{error}</h2>
      </div>
    );
  }

  // Si les données ne sont pas chargées (cas improbable)
  if (!dashboardData) {
    return <div className="p-8 text-center text-muted-foreground">Aucune donnée disponible.</div>;
  }

  // Extraction des données pour un code plus lisible
  const { kpis, revenueLast7Days, popularGames, riskAnalysis } = dashboardData;
  
  const kpiCards = [
    { title: "Chiffre d'Affaires", value: `${kpis.totalRevenue.toLocaleString('fr-FR')} F`, icon: TrendingUp, color: "#FFD700", trend: `${kpis.revenueTrend >= 0 ? '+' : ''}${kpis.revenueTrend.toFixed(1)}%` },
    { title: "Gains Payés", value: `${kpis.totalWinnings.toLocaleString('fr-FR')} F`, icon: TrendingDown, color: "#FF6B00", trend: `${kpis.winningsTrend.toFixed(1)}%` },
    { title: "Bénéfice Brut", value: `${kpis.totalProfit.toLocaleString('fr-FR')} F`, icon: Trophy, color: "#4F00BC", trend: `${kpis.profitTrend >= 0 ? '+' : ''}${kpis.profitTrend.toFixed(1)}%` },
    { title: "Nouveaux Joueurs", value: kpis.newPlayers.toString(), icon: Users, color: "#00C853", trend: `+${kpis.newPlayers}` },
  ];

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
      <div><h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Tableau de Bord</h1><p className="text-xs sm:text-sm text-muted-foreground mt-1">Vue d'ensemble de l'activité de la plateforme</p></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {kpiCards.map((kpi, index) => <Card key={index} className="p-3 sm:p-4 md:p-6"><div className="flex items-start justify-between gap-2"><div className="flex-1 min-w-0"><p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">{kpi.title}</p><p className="text-base sm:text-lg md:text-2xl font-bold">{kpi.value}</p><p className="text-xs sm:text-sm mt-1 sm:mt-2" style={{ color: kpi.color }}>{kpi.trend}</p></div><div className="p-1.5 sm:p-2 md:p-3 rounded-lg" style={{ backgroundColor: `${kpi.color}20` }}><kpi.icon className="h-4 w-4 sm:h-6 sm:w-6" style={{ color: kpi.color }} /></div></div></Card>)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-4 md:p-6"><h3 className="text-base md:text-lg font-bold mb-4">Revenus des 7 derniers jours</h3><ResponsiveContainer width="100%" height={300}><BarChart data={revenueLast7Days}><CartesianGrid strokeDasharray="3 3" stroke="#333" /><XAxis dataKey="day" stroke="#888" fontSize={12} /><YAxis stroke="#888" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #333' }} formatter={(value: number) => `${value.toLocaleString('fr-FR')} F`} /><Bar dataKey="amount" fill="#FFD700" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></Card>
        <Card className="p-4 md:p-6"><h3 className="text-base md:text-lg font-bold mb-4">Jeux les plus populaires</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={popularGames} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}><Tooltip formatter={(value: number) => `${value}%`} />{popularGames.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}</Pie><Legend wrapperStyle={{ fontSize: '12px' }} /></PieChart></ResponsiveContainer></Card>
      </div>

      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-red-500/20"><AlertTriangle className="h-5 w-5 text-red-500" /></div><div><h3 className="text-base md:text-lg font-bold">Combinaisons à Surveiller</h3><p className="text-xs sm:text-sm text-muted-foreground">Suivi en temps réel des combinaisons les plus jouées</p></div></div>
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}><SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1h">Dernière heure</SelectItem><SelectItem value="today">Aujourd'hui</SelectItem><SelectItem value="week">Cette semaine</SelectItem><SelectItem value="all">Tout</SelectItem></SelectContent></Select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-3 rounded-lg border"><p className="text-xs text-muted-foreground mb-1">Total combinaisons</p><p className="text-lg font-bold">{riskAnalysis.summary.totalCombinations}</p></div>
          <div className="p-3 rounded-lg border"><p className="text-xs text-muted-foreground mb-1">Mises totales</p><p className="text-lg font-bold">{riskAnalysis.summary.totalAtRisk.toLocaleString('fr-FR')} F</p></div>
          <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/10"><p className="text-xs text-red-400 mb-1">Risque critique</p><p className="text-lg font-bold text-red-500">{riskAnalysis.summary.criticalRisk}</p></div>
          <div className="p-3 rounded-lg border border-orange-500/30 bg-orange-500/10"><p className="text-xs text-orange-400 mb-1">Risque élevé</p><p className="text-lg font-bold text-orange-500">{riskAnalysis.summary.highRisk}</p></div>
          <div className="p-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10"><p className="text-xs text-yellow-400 mb-1">Risque moyen</p><p className="text-lg font-bold text-yellow-500">{riskAnalysis.summary.mediumRisk}</p></div>
          <div className="p-3 rounded-lg border"><p className="text-xs text-muted-foreground mb-1">Gain potentiel max</p><p className="text-lg font-bold text-[#FFD700]">{riskAnalysis.summary.maxPotentialPayout.toLocaleString('fr-FR')} F</p></div>
        </div>
        {riskAnalysis.combinations.length === 0 ? (<div className="text-center py-12"><p className="text-muted-foreground">Aucune combinaison jouée pour la période sélectionnée</p></div>) : (<div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b"><th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Rang</th><th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Combinaison</th><th className="text-left py-3 px-2 text-xs font-medium text-muted-foreground">Jeu</th><th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">Fois jouée</th><th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground">Mise totale</th><th className="text-right py-3 px-2 text-xs font-medium text-muted-foreground">Gain potentiel</th><th className="text-center py-3 px-2 text-xs font-medium text-muted-foreground">Risque</th></tr></thead><tbody>{riskAnalysis.combinations.map((stat, index) => (<tr key={index} className="border-b border-border/50 hover:bg-muted/30"><td className="py-3 px-2"><span className="font-medium">#{index + 1}</span></td><td className="py-3 px-2"><div className="flex flex-wrap gap-1">{stat.combination.map((num) => (<span key={num} className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FF6B00] text-white text-xs font-bold">{num}</span>))}</div></td><td className="py-3 px-2"><span className="text-sm">{stat.operatorName}</span></td><td className="py-3 px-2 text-center"><span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">{stat.count}×</span></td><td className="py-3 px-2 text-right"><span className="font-medium">{stat.totalAmount.toLocaleString()} F</span></td><td className="py-3 px-2 text-right"><span className="font-bold text-[#FFD700]">{stat.potentialPayout.toLocaleString()} F</span></td><td className="py-3 px-2 text-center"><Badge variant="outline" className={`text-xs font-medium border ${getRiskColor(stat.riskLevel)}`}>{getRiskLabel(stat.riskLevel)}</Badge></td></tr>))}</tbody></table></div>)}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border"><p className="text-xs text-muted-foreground"><strong className="text-foreground">💡 Note:</strong> Cette section affiche les combinaisons qui sont le plus jouées sur les tirages à venir. Le "Gain potentiel" représente le montant total que vous devrez payer si cette combinaison gagne. Préparez vos caisses en conséquence pour les combinaisons à risque élevé.</p></div>
      </Card>
    </div>
  );
}