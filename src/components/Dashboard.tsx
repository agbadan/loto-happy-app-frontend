import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { RechargeModal } from "./RechargeModal";
import { WinnerFeed } from "./WinnerFeed";
import { WinNotificationPanel } from "./WinNotification";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Calendar, Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { getUpcomingDraws, Draw } from "../utils/drawsAPI";
import { getOperators, Operator } from "../utils/dashboardAPI";

interface DashboardProps {
  onNavigateToGame: (drawId: string) => void;
  onNavigateToProfile: () => void;
  onNavigateToResellers: (amount?: number) => void;
  onNavigateToResults: () => void;
  onLogout: () => void;
}

export function Dashboard({
  onNavigateToGame,
  onNavigateToProfile,
  onNavigateToResellers,
  onNavigateToResults,
  onLogout,
}: DashboardProps) {
  const { user } = useAuth();
  const playBalance = user?.balanceGame ?? 0;
  const winningsBalance = user?.balanceWinnings ?? 0;

  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [availableDraws, setAvailableDraws] = useState<Draw[]>([]);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [featuredDraw, setFeaturedDraw] = useState<Draw | null>(null);
  const [countdownTime, setCountdownTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [operatorsData, drawsData] = await Promise.all([getOperators(), getUpcomingDraws()]);
        
        // Note: l'API /upcoming ne renvoie pas date/time mais drawDate
        // Nous adaptons la logique de filtrage à la structure de `drawsAPI`
        const now = new Date();
        const validDraws = drawsData
          .filter(draw => new Date(draw.drawDate).getTime() > now.getTime())
          .sort((a, b) => new Date(a.drawDate).getTime() - new Date(b.drawDate).getTime());
        
        setOperators(operatorsData);
        setAvailableDraws(validDraws);
        setFeaturedDraw(validDraws[0] || null);
      } catch (err) {
        console.error('Erreur chargement données dashboard:', err);
        setError('Impossible de charger les données du dashboard.');
        toast.error('Erreur de chargement.');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!featuredDraw) return;
    const timer = setInterval(() => {
      const now = new Date();
      const drawDateTime = new Date(featuredDraw.drawDate);
      const diff = drawDateTime.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdownTime({ hours: 0, minutes: 0, seconds: 0 });
        const updatedDraws = availableDraws.filter(d => d.id !== featuredDraw.id);
        setAvailableDraws(updatedDraws);
        setFeaturedDraw(updatedDraws[0] || null);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setCountdownTime({ hours: h, minutes: m, seconds: s });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [featuredDraw, availableDraws]);

  const getOperatorById = (id: string) => operators.find(op => op.id === id);

  if (loading) {
     return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header balance={0} onRecharge={() => {}} onProfile={() => {}} onLogout={onLogout} />
        <main className="flex-1 flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></main>
        <Footer onNavigateToResults={onNavigateToResults} />
      </div>
    );
  }

  const featuredOperator = featuredDraw ? getOperatorById(featuredDraw.operatorId) : null;
  const featuredDrawDate = featuredDraw ? new Date(featuredDraw.drawDate) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header balance={playBalance} onRecharge={() => setRechargeOpen(true)} onProfile={onNavigateToProfile} onLogout={onLogout}/>
      {user && <WinNotificationPanel />}
      <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col">
        {featuredDraw && featuredOperator && featuredDrawDate ? (
            <section className="mb-8 sm:mb-12 md:mb-16">
            <Card className="relative overflow-hidden border-none gradient-orange-violet confetti-bg">
              <div className="relative z-10 p-4 sm:p-6 md:p-8 text-center"><div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                  <span className="text-3xl sm:text-4xl md:text-5xl">{featuredOperator.icon}</span>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white">{featuredOperator.name}</h1>
                </div>
                <div className="text-base sm:text-lg md:text-xl text-white/90 text-center">
                  <div className="text-sm sm:text-base">{featuredOperator.country}</div>
                  <div className="font-bold text-[#FFD700] text-lg sm:text-xl mt-2"><Trophy className="inline h-5 w-5 sm:h-6 sm:w-6 mr-2" />Tentez de gagner jusqu'à 100,000× votre mise !</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2 text-white/90 mb-2">
                    <Calendar className="h-4 w-4" /><span className="text-xs sm:text-sm">{featuredDrawDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-white mb-3"><Clock className="h-4 w-4" /><span className="text-xs sm:text-sm">Tirage à {featuredDrawDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span></div>
                  <div className="flex justify-center gap-3">
                    {[{ label: "Heures", value: countdownTime.hours }, { label: "Min", value: countdownTime.minutes }, { label: "Sec", value: countdownTime.seconds }].map((item) => (
                      <div key={item.label} className="flex flex-col items-center gap-1">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10"><span className="text-lg font-bold text-white">{String(item.value).padStart(2, "0")}</span></div>
                        <span className="text-xs text-white/80">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button size="lg" className="h-14 bg-[#FFD700] px-8 hover:bg-[#FFD700]/90 text-[#121212] shadow-lg" onClick={() => onNavigateToGame(featuredDraw.id)}>Jouer Maintenant</Button>
              </div></div>
            </Card>
            </section>
        ) : (
          !loading && <Card className="p-8 text-center"><p className="text-muted-foreground">Aucun tirage disponible pour le moment.</p></Card>
        )}
        {availableDraws.length > 0 && <section className="mb-12">
            <div className="mb-6"><h2 className="text-2xl font-bold text-foreground">Autres Tirages Disponibles</h2><p className="text-muted-foreground">Choisissez votre tirage et tentez votre chance</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableDraws.map(draw => {
                const operator = getOperatorById(draw.operatorId);
                if (!operator) return null;
                const drawDate = new Date(draw.drawDate);
                return (
                <Card key={draw.id} className="group relative overflow-hidden border-2 border-border hover:border-[#FFD700] transition-all cursor-pointer" onClick={() => onNavigateToGame(draw.id)}>
                    <div className="absolute inset-0 opacity-10" style={{ backgroundColor: operator.color }}/>
                    <div className="relative p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{operator.icon}</span>
                        <div><h3 className="font-bold text-lg">{operator.name}</h3><p className="text-sm text-muted-foreground">{operator.country}</p></div>
                    </div>
                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" /><span>{drawDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}</span></div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="h-4 w-4" /><span>{drawDate.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</span></div>
                    </div>
                    <Button className="w-full bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90">Jouer</Button>
                    </div>
                </Card>
                );
            })}
            </div>
        </section>}
        <WinnerFeed onNavigateToResults={onNavigateToResults} />
      </main>
      <Footer onNavigateToResults={onNavigateToResults}/>
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} balance={playBalance} onNavigateToResellers={onNavigateToResellers}/>
    </div>
  );
}