import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Calendar, Clock, Sparkles } from "lucide-react";
import { GameConfig } from "../utils/games";

interface GameCardProps {
  game: GameConfig;
  nextDrawDate: string;
  nextDrawTime: string;
  countdown: string;
  onClick: () => void;
}

export function GameCard({ game, nextDrawDate, nextDrawTime, countdown, onClick }: GameCardProps) {
  return (
    <Card 
      className="group overflow-hidden border border-border bg-card transition-all hover:shadow-lg cursor-pointer"
      style={{ 
        borderColor: `${game.color}20`,
      }}
      onClick={onClick}
    >
      {/* Header avec icône et type */}
      <div 
        className="relative p-6 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${game.color} 0%, ${game.color}dd 100%)` 
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{game.icon}</span>
            <div>
              <h3 className="font-bold text-xl">{game.name}</h3>
              <p className="text-sm text-white/80">{game.country}</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-semibold uppercase">{game.type}</span>
          </div>
        </div>

        {/* Info du jeu */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/80">Sélectionner</span>
            <span className="font-bold">{game.numbersCount} numéros</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-white/80">Pool</span>
            <span className="font-bold">1 - {game.numbersMax}</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="space-y-4 p-6">
        {/* Prochain Tirage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{nextDrawDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Tirage à {nextDrawTime}</span>
          </div>
          <div 
            className="flex items-center gap-2 font-semibold"
            style={{ color: game.color }}
          >
            <Sparkles className="h-4 w-4" />
            <span className="text-sm">{countdown}</span>
          </div>
        </div>

        {/* Prix et Gains */}
        <div className="bg-muted rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Mise minimale</span>
            <span className="font-bold text-foreground">{game.minBet.toLocaleString('fr-FR')} F</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Gain max ({game.numbersCount}/{game.numbersCount})</span>
            <span 
              className="font-bold"
              style={{ color: game.color }}
            >
              {game.prizes[game.numbersCount]?.toLocaleString('fr-FR')} F
            </span>
          </div>
        </div>

        {/* Bouton Jouer */}
        <Button
          className="w-full rounded-full text-[#121212] hover:opacity-90 transition-all shadow-md"
          style={{ backgroundColor: game.color }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Jouer Maintenant
        </Button>
      </div>
    </Card>
  );
}
