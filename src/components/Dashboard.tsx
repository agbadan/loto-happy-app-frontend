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
  onLogout,
}: DashboardProps) {
  const { user } = useAuth();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [availableDraws, setAvailableDraws] = useState<Draw[]>([]);
  const [featuredDraw, setFeaturedDraw] = useState<Draw | null>(null);
  const [countdownTime, setCountdownTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDraws = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const draws = await getUpcomingDraws();
        const now = new Date();
        
        // ====================== DÉBUT DE LA CORRECTION FINALE ======================
        // On utilise `draw.date` et `draw.time` comme confirmé par l'API Backend.
        const validDraws = draws
          .filter(draw => {
            // On combine les champs pour créer une date valide. 
            // Ajouter ':00Z' force l'interprétation en UTC pour éviter les pbs de fuseaux horaires.
            const drawDateTime = new Date(`${draw.date}T${draw.time}:00Z`);
            return drawDateTime.getTime() > now.getTime();
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}:00Z`);
            const dateB = new Date(`${b.date}T${b.time}:00Z`);
            return dateA.getTime() - dateB.getTime();
          });
        // ======================= FIN DE LA CORRECTION FINALE =======================
        
        setAvailableDraws(validDraws);
        setFeaturedDraw(validDraws[0] || null);
        
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

  // Countdown pour le tirage vedette
  useEffect(() => {
    if (!featuredDraw) return;

    const updateCountdown = () => {
      const now = new Date();
      // CORRECTION : Utilisation de `featuredDraw.date` et `featuredDraw.time`
      const drawDateTime = new Date(`${featuredDraw.date}T${featuredDraw.time}:00Z`);
      const diff = drawDateTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdownTime({ hours: 0, minutes: 0, seconds: 0 });
        // Re-filtrer les tirages pour enlever celui qui vient d'expirer
        setTimeout(() => {
            setAvailableDraws(prev => prev.filter(d => d.id !== featuredDraw.id));
            setFeaturedDraw(availableDraws.find(d => d.id !== featuredDraw.id) || null);
        }, 1000);
        return;
      }
      
      const totalSeconds = Math.floor(diff / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      
      setCountdownTime({ hours: h, minutes: m, seconds: s });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [featuredDraw, availableDraws]);

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          balance={playBalance}
          onRecharge={() => setRechargeOpen(true)}
          onProfile={onNavigateToProfile}
          onLogout={onLogout}
        />
        <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Chargement des tirages...</p>
          </div>
        </main>
        <Footer 
          onNavigateToResults={onNavigateToResults}
        />
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          balance={playBalance}
          onRecharge={() => setRechargeOpen(true)}
          onProfile={onNavigateToProfile}
          onLogout={onLogout}
        />
        <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col items-center justify-center">
          <Card className="border-destructive/50 bg-card p-6 sm:p-8 text-center max-w-md w-full">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </Card>
        </main>
        <Footer 
          onNavigateToResults={onNavigateToResults}
        />
      </div>
    );
  }

  // Aucun tirage disponible
  if (availableDraws.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header
          balance={playBalance}
          onRecharge={() => setRechargeOpen(true)}
          onProfile={onNavigateToProfile}
          onLogout={onLogout}
        />
        {user && <WinNotificationPanel userId={user.id} />}
        <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col items-center justify-center">
          <Card className="border-border bg-card p-6 sm:p-8 text-center max-w-md w-full">
            <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
              Aucun tirage disponible
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Il n'y a actuellement aucun tirage programmé.
              Revenez bientôt !
            </p>
          </Card>
        </main>
        <Footer onNavigateToResults={onNavigateToResults} />
        <RechargeModal 
          open={rechargeOpen} 
          onClose={() => setRechargeOpen(false)} 
          balance={playBalance}
          onNavigateToResellers={onNavigateToResellers}
        />
      </div>
    );
  }
  
  const featuredOperator = featuredDraw ? getOperatorById(featuredDraw.operatorId) : null;
  
  return (
    <div className="min-h-screen bg-background">
      <Header
        balance={playBalance}
        onRecharge={() => setRechargeOpen(true)}
        onProfile={onNavigateToProfile}
        onLogout={onLogout}
      />
      
      {user?.id && <WinNotificationPanel userId={user.id} />}

      <main className="container px-3 sm:px-4 py-6 sm:py-8 flex-1 flex flex-col">
        {/* SECTION 1 : Tirage Vedette */}
        {featuredDraw && featuredOperator && (
          <section className="mb-8 sm:mb-12 md:mb-16">
             <Card className="relative overflow-hidden border-none gradient-orange-violet confetti-bg">
              <div className="relative z-10 p-4 sm:p-6 md:p-8 text-center">
                <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <span className="text-3xl sm:text-4xl md:text-5xl">{featuredOperator.icon}</span>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-bold text-white break-words text-center">
                      {featuredOperator.name}
                    </h1>
                  </div>
                  
                  <div className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 text-center">
                    <div className="text-sm sm:text-base md:text-xl">{featuredOperator.country}</div>
                    <div className="font-bold text-[#FFD700] text-lg sm:text-xl md:text-2xl break-words mt-2">
                      <Trophy className="inline h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                      Tentez de gagner jusqu'à 100,000× votre mise !
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 max-w-md mx-auto">
                    <div className="flex flex-col xs:flex-row items-center justify-center gap-1 xs:gap-2 text-white/90 mb-2">
                       <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">
                           {/* CORRECTION : `new Date` a besoin de la date complète pour être fiable */}
                          {new Date(`${featuredDraw.date}T00:00:00`).toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'long' 
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-1 xs:gap-2 text-white mb-2 sm:mb-3">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                       {/* CORRECTION : On affiche directement le champ `time` */}
                      <span className="text-xs sm:text-sm">Tirage à {featuredDraw.time}</span>
                    </div>
                    
                    <div className="flex justify-center gap-2 sm:gap-3">
                      {[
                        { label: "Heures", value: countdownTime.hours },
                        { label: "Min", value: countdownTime.minutes },
                        { label: "Sec", value: countdownTime.seconds },
                      ].map((item) => (
                        <div key={item.label} className="flex flex-col items-center gap-0.5 sm:gap-1">
                          <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-white/10">
                            <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                              {String(item.value).padStart(2, "0")}
                            </span>
                          </div>
                          <span className="text-[10px] sm:text-xs text-white/80">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="h-12 sm:h-14 bg-[#FFD700] px-6 sm:px-8 hover:bg-[#FFD700]/90 text-[#121212] shadow-lg hover:shadow-xl transition-all text-sm sm:text-base w-full sm:w-auto"
                    onClick={() => onNavigateToGame(featuredDraw.id)}
                  >
                    Jouer Maintenant
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        )}

        {/* SECTION 2 : Tous les Tirages Disponibles */}
        {availableDraws.length > 0 && (
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Tirages Disponibles
              </h2>
              <p className="text-muted-foreground">
                Choisissez votre tirage et tentez votre chance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDraws.map(draw => {
                const operator = getOperatorById(draw.operatorId);
                if (!operator) return null;
                
                const drawDateObj = new Date(`${draw.date}T${draw.time}:00Z`);
                const now = new Date();
                const diff = drawDateObj.getTime() - now.getTime();
                
                let countdown = "Bientôt";
                if (diff > 0) {
                  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                  
                  if (days > 0) {
                    countdown = `Dans ${days}j ${hours}h`;
                  } else if (hours > 0) {
                    countdown = `Dans ${hours}h ${minutes}min`;
                  } else if (minutes > 0) {
                    countdown = `Dans ${minutes}min`;
                  } else {
                    countdown = `Moins d'une min`;
                  }
                } else {
                    countdown = "Terminé"
                }
                
                return (
                  <Card 
                    key={draw.id} 
                    className="group relative overflow-hidden border-2 border-border hover:border-[#FFD700] transition-all duration-300 cursor-pointer"
                    onClick={() => onNavigateToGame(draw.id)}
                  >
                    <div 
                      className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity" 
                      style={{ backgroundColor: operator.color }}
                    />
                    
                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{operator.icon}</span>
                          <div>
                            <h3 className="font-bold text-lg text-foreground">
                              {operator.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {operator.country}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(`${draw.date}T00:00:00`).toLocaleDateString('fr-FR', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short' 
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{draw.time}</span>
                        </div>
                      </div>

                      <Badge className="mb-4 bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">
                        {countdown}
                      </Badge>
                      
                      <Button 
                        className="w-full bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToGame(draw.id);
                        }}
                      >
                        Jouer
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        <WinnerFeed onNavigateToResults={onNavigateToResults} />
      </main>

      <Footer onNavigateToResults={onNavigateToResults} />

      <RechargeModal 
        open={rechargeOpen} 
        onClose={() => setRechargeOpen(false)} 
        balance={playBalance}
        onNavigateToResellers={onNavigateToResellers}
      />
    </div>
  );
}