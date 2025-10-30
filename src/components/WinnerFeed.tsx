import { useState, useEffect } from "react";
import { Trophy } from "lucide-react";
import { Card } from "./ui/card";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "./ThemeProvider";
import { getDraws } from "../utils/draws";
import { getTickets } from "../utils/draws";

interface Winner {
  id: string;
  username: string;
  gameName: string;
  amount: number;
  date: string;
}

export function WinnerFeed() {
  const [visibleWinners, setVisibleWinners] = useState<Winner[]>([]);
  const [allWinners, setAllWinners] = useState<Winner[]>([]);
  const [winnerIndex, setWinnerIndex] = useState(4);
  
  // Récupérer le thème actuel
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';

  // Charger les vrais gagnants depuis localStorage
  useEffect(() => {
    const tickets = getTickets();
    const draws = getDraws();
    
    // Filtrer les tickets gagnants
    const winningTickets = tickets.filter(t => t.status === 'won' && t.winAmount && t.winAmount > 0);
    
    // Créer la liste des gagnants avec infos complètes
    const winners: Winner[] = winningTickets.map(ticket => {
      const draw = draws.find(d => d.id === ticket.drawId);
      return {
        id: ticket.id,
        username: ticket.username,
        gameName: ticket.gameName,
        amount: ticket.winAmount || 0,
        date: ticket.purchaseDate,
      };
    });
    
    // Trier par date (plus récent en premier)
    winners.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setAllWinners(winners);
    setVisibleWinners(winners.slice(0, Math.min(4, winners.length)));
  }, []);

  // Animation de rotation automatique toutes les 5 secondes
  useEffect(() => {
    if (allWinners.length <= 4) return; // Pas besoin d'animation si moins de 4 gagnants

    const interval = setInterval(() => {
      setVisibleWinners((current) => {
        if (current.length === 0) return current;

        // Retirer le dernier gagnant (le plus ancien)
        const remaining = current.slice(0, -1);

        // Récupérer le prochain gagnant du pool
        const nextWinner = allWinners[winnerIndex % allWinners.length];
        
        // Incrémenter l'index pour le prochain
        setWinnerIndex((prev) => prev + 1);

        // Ajouter le nouveau gagnant au début
        return [nextWinner, ...remaining];
      });
    }, 5000); // Rotation toutes les 5 secondes

    return () => clearInterval(interval);
  }, [winnerIndex, allWinners]);

  // Calculer "il y a X min/heures"
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `il y a ${days}j`;
    if (hours > 0) return `il y a ${hours}h`;
    if (minutes > 0) return `il y a ${minutes} min`;
    return "à l'instant";
  };

  if (visibleWinners.length === 0) {
    return (
      <Card className="p-8 text-center border-border bg-card">
        <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Aucun gagnant pour le moment</p>
        <p className="text-sm text-muted-foreground mt-2">
          Les gagnants récents apparaîtront ici
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">
        Ils ont gagné récemment ! 🎉
      </h2>
      
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {visibleWinners.map((winner) => (
            <motion.div
              key={winner.id}
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.5,
                  ease: "easeOut"
                }
              }}
              exit={{ 
                opacity: 0, 
                y: 20,
                transition: {
                  duration: 0.4,
                  ease: "easeIn"
                }
              }}
            >
              <Card
                className="flex items-center gap-4 p-4 transition-all rounded-xl"
                style={{
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#e5e5e5',
                }}
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500]">
                  <Trophy className="h-7 w-7 text-[#121212]" />
                </div>

                <div className="flex-1 space-y-1">
                  <p 
                    className="text-sm"
                    style={{ color: isDark ? '#EAEAEA' : '#1C1C1E' }}
                  >
                    <span className="font-bold">{winner.username}</span>{" "}
                    <span style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}>
                      au {winner.gameName}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-[#FFD700]">
                      {winner.amount.toLocaleString('fr-FR')} F CFA
                    </span>
                    <span 
                      className="text-xs"
                      style={{ color: isDark ? '#8E8E93' : '#6e6e73' }}
                    >
                      • {getTimeAgo(winner.date)}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
