// src/components/Dashboard.tsx

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { RechargeModal } from "./RechargeModal";
import { WinnerFeed } from "./WinnerFeed";
import { WinNotificationPanel } from "./WinNotification";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, Calendar, TrendingUp, Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { getUpcomingDraws, Draw } from "../utils/drawsAPI";
import { getOperatorById, formatDrawDisplay } from "../utils/games";

interface DashboardProps {
  onNavigateToGame: (drawId: string) => void;
  onNavigateToProfile: () => void;
  onNavigateToResellers: (amount?: number) => void;
  onNavigateToResults: () => void;
  playBalance?: number;
  winningsBalance?: number;
  onRecharge: (amount: number) => void;
  onLogout: () => void;
}

export function Dashboard({
  onNavigateToGame,
  onNavigateToProfile,
  onNavigateToResellers,
  onNavigateToResults,
  playBalance = 0,
  winningsBalance = 0,
  onRecharge,
  onLogout, // CORRECTION : Prop ajoutée
}: DashboardProps) {
  const { user } = useAuth();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [availableDraws, setAvailableDraws] = useState<Draw[]>([]);
  const [featuredDraw, setFeaturedDraw] = useState<Draw | null>(null);
  const [countdownTime, setCountdownTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDraws = async () => {
      // Afficher le loader uniquement au premier chargement
      if (availableDraws.length === 0) {
        setLoading(true);
      }
      setError(null);
      
      try {
        const draws = await getUpcomingDraws();
        setAvailableDraws(draws);
        setFeaturedDraw(draws[0] || null);
        
      } catch (err) {
        console.error('Erreur chargement tirages:', err);
        setError('Impossible de charger les tirages');
        toast.error('Erreur lors du chargement des tirages');
      } finally {
        setLoading(false);
      }
    };
    
    loadDraws();
    
    const interval = setInterval(loadDraws, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!featuredDraw) return;

    const updateCountdown = () => {
      const now = new Date();
      // CORRECTION: Utiliser le champ unique `drawDate`
      const drawDateTime = new Date(featuredDraw.drawDate);
      const diff = drawDateTime.getTime() - now.getTime();
      
      if (diff > 0) {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setCountdownTime({ days: d, hours: h, minutes: m, seconds: s });
      } else {
        setCountdownTime({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [featuredDraw]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header balance={playBalance} onRecharge={() => setRechargeOpen(true)} onProfile={onNavigateToProfile} />
        <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des tirages...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header balance={playBalance} onRecharge={() => setRechargeOpen(true)} onProfile={onNavigateToProfile} />
        <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col items-center justify-center">
          <Card className="border-destructive/50 bg-card p-6 sm:p-8 text-center max-w-md w-full">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (availableDraws.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header balance={playBalance} onRecharge={() => setRechargeOpen(true)} onProfile={onNavigateToProfile} />
        {user && <WinNotificationPanel userId={user.id} />}
        <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col items-center justify-center">
          <Card className="border-border bg-card p-6 sm:p-8 text-center max-w-md w-full">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">Aucun tirage disponible</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">Il n'y a actuellement aucun tirage programmé. Revenez bientôt !</p>
          </Card>
        </main>
        <Footer />
        <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} balance={playBalance} onNavigateToResellers={onNavigateToResellers} />
      </div>
    );
  }

  const featuredOperator = featuredDraw ? getOperatorById(featuredDraw.operatorId) : null;
  const featuredDrawInfo = featuredDraw ? formatDrawDisplay(featuredDraw) : null;

  return (
    <div className="min-h-screen bg-background">
      <Header balance={playBalance} onRecharge={() => setRechargeOpen(true)} onProfile={onNavigateToProfile} />
      
      {/* CORRECTION : Utiliser user.id au lieu de la variable inexistante userId */}
      {user?.id && <WinNotificationPanel userId={user.id} />}

      <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col">
        {featuredDraw && featuredOperator && featuredDrawInfo && (
          <section className="mb-8 sm:mb-12 md:mb-16">
            <Card className="relative overflow-hidden border-none gradient-orange-violet confetti-bg">
              <div className="relative z-10 p-4 sm:p-6 md:p-8 text-center">
                <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl md:text-5xl">{featuredOperator.icon}</span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white break-words text-center">{featuredOperator.name}</h1>
                  </div>
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 text-center">
                    <div className="text-sm sm:text-base md:text-xl">{featuredOperator.country}</div>
                    <div className="font-bold text-[#FFD700] text-lg sm:text-xl md:text-2xl break-words mt-2"><Trophy className="inline h-5 w-5 sm:h-6 sm:w-6 mr-2" />Tentez de gagner jusqu'à 100,000× votre mise !</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 max-w-md mx-auto">
                    <div className="flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 text-white/90 mb-2">
                      <div className="flex items-center gap-2"><Calendar className="h-3 w-3 sm:h-4 sm:w-4" /><span className="text-xs sm:text-sm">{new Date(featuredDraw.drawDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span></div>
                    </div>
                    <div className="flex items-center justify-center gap-1 xs:gap-2 text-white mb-2 sm:mb-3"><Clock className="h-3 w-3 sm:h-4 sm:w-4" /><span className="text-xs sm:text-sm">Tirage à {new Date(featuredDraw.drawDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>
                    <div className="flex justify-center gap-2 sm:gap-3">
                        {countdownTime.days > 0 && <div className="flex flex-col items-center gap-0.5 sm:gap-1"><div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white/10"><span className="text-base sm:text-lg md:text-xl font-bold text-white">{String(countdownTime.days).padStart(2, "0")}</span></div><span className="text-[10px] sm:text-xs text-white/80">Jours</span></div>}
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1"><div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white/10"><span className="text-base sm:text-lg md:text-xl font-bold text-white">{String(countdownTime.hours).padStart(2, "0")}</span></div><span className="text-[10px] sm:text-xs text-white/80">Heures</span></div>
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1"><div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white/10"><span className="text-base sm:text-lg md:text-xl font-bold text-white">{String(countdownTime.minutes).padStart(2, "0")}</span></div><span className="text-[10px] sm:text-xs text-white/80">Min</span></div>
                        <div className="flex flex-col items-center gap-0.5 sm:gap-1"><div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white/10"><span className="text-base sm:text-lg md:text-xl font-bold text-white">{String(countdownTime.seconds).padStart(2, "0")}</span></div><span className="text-[10px] sm:text-xs text-white/80">Sec</span></div>
                    </div>
                  </div>
                  <Button size="lg" className="h-12 sm:h-14 bg-[#FFD700] px-6 sm:px-8 hover:bg-[#FFD700]/90 text-[#121212] shadow-lg hover:shadow-xl transition-all text-sm sm:text-base w-full sm:w-auto" onClick={() => onNavigateToGame(featuredDraw.id)}>Jouer Maintenant</Button>
                </div>
              </div>
            </Card>
          </section>
        )}
        <WinnerFeed onNavigateToResults={onNavigateToResults} />
      </main>
      <Footer />
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} balance={playBalance} onNavigateToResellers={onNavigateToResellers} />
    </div>
  );
}