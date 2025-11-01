import { useState, useEffect } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { getWinnerFeed, Winner } from '../utils/dashboardAPI';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WinnerFeedProps {
  onNavigateToResults: () => void;
}

export function WinnerFeed({ onNavigateToResults }: WinnerFeedProps) {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const winnerData = await getWinnerFeed();
        setWinners(winnerData);
      } catch (err) {
        console.error("Failed to fetch winner feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWinners();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 gap-2 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Chargement des gagnants...</span>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <Card className="p-8 text-center border-border bg-card">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-bold text-lg">Aucun gagnant pour le moment</h3>
        <p className="text-muted-foreground mt-1">Les gagnants récents apparaîtront ici</p>
      </Card>
    );
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Ils ont gagné récemment ! 🎉</h2>
        <Button variant="link" onClick={onNavigateToResults}>Voir tout</Button>
      </div>
      <div className="space-y-3">
        {winners.map((winner, index) => (
          <Card key={index} className="flex items-center gap-4 p-4 transition-all rounded-xl">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500]">
              <Trophy className="h-7 w-7 text-[#121212]" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm">
                <span className="font-bold">{winner.playerName}</span>{" "}
                <span className="text-muted-foreground">au {winner.gameName}</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-[#FFD700]">{winner.winAmount.toLocaleString('fr-FR')} F</span>
                <span className="text-xs text-muted-foreground">• {formatDistanceToNow(new Date(winner.winDate), { locale: fr, addSuffix: true })}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}