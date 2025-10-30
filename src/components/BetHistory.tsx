import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Calendar, Clock, TrendingUp, TrendingDown, Timer, Trophy, X, Loader2 } from "lucide-react";
import { getBetHistory, BetHistoryItem } from "../utils/drawsAPI";
import { toast } from "sonner@2.0.3";

interface BetHistoryProps {
  userId: string;
}

export function BetHistory({ userId }: BetHistoryProps) {
  const [bets, setBets] = useState<BetHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'pending' | 'won' | 'lost'>('all');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const history = await getBetHistory();
        const sorted = history.sort((a, b) => 
          new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
        );
        setBets(sorted);
      } catch (err) {
        setError("Impossible de charger l'historique des paris.");
        toast.error("Impossible de charger l'historique des paris.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  const filteredBets = filter === 'all' 
    ? bets 
    : bets.filter(bet => bet.status === filter);

  if (loading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-8 text-center">Failed to edit, 0 occurrences found for old_string (import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Calendar, Clock, TrendingUp, TrendingDown, Timer, Trophy, X } from "lucide-react";
import { getBetHistory, BetHistoryItem } from "../utils/draws";
import { getOperatorById } from "../utils/games";

interface BetHistoryProps {
  userId: string;
}

export function BetHistory({ userId }: BetHistoryProps) {
  const [bets, setBets] = useState<BetHistoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'pending' | 'won' | 'lost'>('all');

  useEffect(() => {
    const history = getBetHistory(userId);
    // Trier par date de pari (plus récent en premier)
    const sorted = history.sort((a, b) => 
      new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    );
    setBets(sorted);
  }, [userId]);

  const filteredBets = filter === 'all' 
    ? bets 
    : bets.filter(bet => bet.status === filter);

  // ... (rest of the component is the same)
}) in C:\Users\Geeklab\Desktop\Projet Casino\Code source Backend lotto happy\loto-happy-frontend\src\components\BetHistory.tsx. No edits made. The exact text in old_string was not found. Ensure you're not escaping content incorrectly and check whitespace, indentation, and context. Use read_file tool to verify.</div>;
  }

  // ... (rest of the component is the same)
}

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-[#009DD9]/20 text-[#009DD9] border-[#009DD9]/30">
          <Timer className="h-3 w-3 mr-1" />
          À venir
        </Badge>;
      case 'pending':
        return <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30">
          <Clock className="h-3 w-3 mr-1" />
          En attente
        </Badge>;
      case 'won':
        return <Badge className="bg-[#00A651]/20 text-[#00A651] border-[#00A651]/30">
          <Trophy className="h-3 w-3 mr-1" />
          Gagné
        </Badge>;
      case 'lost':
        return <Badge className="bg-muted text-muted-foreground border-border">
          <X className="h-3 w-3 mr-1" />
          Perdu
        </Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (bets.length === 0) {
    return (
      <Card className="border-border bg-card p-8 text-center">
        <div className="mx-auto max-w-md">
          <div className="rounded-full bg-muted p-6 w-fit mx-auto mb-4">
            <TrendingDown className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-foreground mb-2">Aucun pari pour le moment</h3>
          <p className="text-muted-foreground text-sm">
            Vos paris apparaîtront ici une fois que vous aurez joué à un jeu.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filtres - Défilables sur mobile */}
      <div className="w-full overflow-x-auto scrollbar-visible -mx-3 px-3 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
          {[
            { value: 'all', label: 'Tous' },
            { value: 'upcoming', label: 'À venir' },
            { value: 'pending', label: 'En attente' },
            { value: 'won', label: 'Gagnés' },
            { value: 'lost', label: 'Perdus' },
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value as any)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                filter === value
                  ? 'bg-[#FFD700] text-[#121212]'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card className="border-border bg-card p-2 sm:p-3 md:p-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Total Paris</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{bets.length}</p>
        </Card>
        <Card className="border-border bg-card p-2 sm:p-3 md:p-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Total Misé</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-foreground break-words">
            {bets.reduce((sum, bet) => sum + bet.betAmount, 0).toLocaleString('fr-FR')} F
          </p>
        </Card>
        <Card className="border-border bg-card p-2 sm:p-3 md:p-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Total Gagné</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#00A651] break-words">
            {bets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0).toLocaleString('fr-FR')} F
          </p>
        </Card>
        <Card className="border-border bg-card p-2 sm:p-3 md:p-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-0.5 sm:mb-1">Paris Gagnants</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-[#FFD700]">
            {bets.filter(bet => bet.status === 'won').length}
          </p>
        </Card>
      </div>

      {/* Liste des Paris */}
      <div className="space-y-4">
        {filteredBets.length === 0 ? (
          <Card className="border-border bg-card p-6 text-center">
            <p className="text-muted-foreground">Aucun pari dans cette catégorie</p>
          </Card>
        ) : (
          filteredBets.map((bet) => {
            // Utiliser une couleur par défaut puisqu'on n'a plus de gameId
            const gameColor = '#FFD700';

            return (
              <Card 
                key={bet.id} 
                className="border-border bg-card overflow-hidden"
              >
                {/* Header coloré */}
                <div 
                  className="p-4 text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${gameColor} 0%, ${gameColor}dd 100%)` 
                  }}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{bet.gameName}</h3>
                      <p className="text-sm text-white/80">
                        Pari du {formatDate(bet.purchaseDate)}
                      </p>
                    </div>
                    {getStatusBadge(bet.status)}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4 space-y-4">
                  {/* Vos Numéros */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Vos numéros :</p>
                    <div className="flex flex-wrap gap-2">
                      {bet.numbers.split(',').map((num, index) => (
                        <div
                          key={index}
                          className="px-3 py-1 rounded-lg font-bold text-[#121212]"
                          style={{ backgroundColor: gameColor }}
                        >
                          {num.trim()}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Numéros Gagnants (si tirage archivé) */}
                  {bet.winningNumbers && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Numéros gagnants :</p>
                        <div className="flex flex-wrap gap-2">
                          {(Array.isArray(bet.winningNumbers) 
                            ? bet.winningNumbers 
                            : bet.winningNumbers.toString().split(',')
                          ).map((num, index) => {
                            const numStr = num.toString().trim();
                            const isMatch = bet.numbers.split(',').map(n => n.trim()).includes(numStr);
                            return (
                              <div
                                key={index}
                                className={`px-3 py-1 rounded-lg font-bold ${
                                  isMatch
                                    ? 'text-[#121212] ring-2 ring-offset-2'
                                    : 'bg-muted text-muted-foreground'
                                }`}
                                style={isMatch ? { 
                                  backgroundColor: gameColor,
                                  ringColor: gameColor
                                } : {}}
                              >
                                {numStr}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Infos du Tirage */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Date du tirage</p>
                          <p className="font-semibold text-foreground">
                            {new Date(bet.drawDate).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Heure</p>
                          <p className="font-semibold text-foreground">{bet.drawTime}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Mise</p>
                          <p className="font-semibold text-foreground">
                            {bet.betAmount.toLocaleString('fr-FR')} F
                          </p>
                        </div>
                      </div>
                      {bet.winAmount && bet.winAmount > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <TrendingUp className="h-4 w-4 text-[#00A651]" />
                          <div>
                            <p className="text-xs text-muted-foreground">Gain</p>
                            <p className="font-semibold text-[#00A651]">
                              + {bet.winAmount.toLocaleString('fr-FR')} F
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
