// src/components/NationalGameCard.tsx

// On n'a PLUS BESOIN d'importer les SVG ici. Le composant est maintenant plus simple.

import { Button } from "./ui/button";
import { Card } from "./ui/card";

// Définition des propriétés (props) que le composant attend de recevoir
interface NationalGameCardProps {
  id: string;
  flagUrl: string; // PROP MODIFIÉE: On attend maintenant une URL de drapeau
  organizationName: string;
  gameName: string;
  jackpot: number;
  onPlay: () => void;
}

// Définition du composant React
export function NationalGameCard({
  id,
  flagUrl, // On utilise la nouvelle prop
  organizationName,
  gameName,
  jackpot,
  onPlay,
}: NationalGameCardProps) {
  return (
    <Card
      id={id}
      className="group overflow-hidden border border-border bg-card transition-all hover:border-[#FFD700]/30 hover:shadow-lg hover:shadow-[#FFD700]/10 scroll-mt-20"
    >
      {/* Zone d'affichage du drapeau */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] flex items-center justify-center">
        {/* LOGIQUE SIMPLIFIÉE: On utilise directement l'URL dans la balise <img> */}
        {flagUrl ? (
          <img
            src={flagUrl} // La source est maintenant la prop 'flagUrl'
            alt={`Drapeau de ${organizationName}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          // Fallback au cas où l'URL est manquante
          <div className="w-full h-full bg-gray-700" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent opacity-50" />
      </div>

      {/* Zone d'information sous le drapeau */}
      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {organizationName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Jeu : {gameName}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">
              Jackpot
            </p>
            <p className="text-xl font-bold text-[#FFD700]">
              {jackpot.toLocaleString("fr-FR")} FCFA
            </p>
          </div>

          <Button
            className="rounded-full bg-[#FFD700] px-6 text-[#121212] hover:bg-[#FFD700]/90 hover:shadow-lg hover:shadow-[#FFD700]/30 transition-all"
            onClick={onPlay}
          >
            Jouer
          </Button>
        </div>
      </div>
    </Card>
  );
}