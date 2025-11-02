// src/components/GameScreen.tsx

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { RechargeModal } from "./RechargeModal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Calendar, Clock, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
// NOUVEAUX IMPORTS API
import { getDrawById, Draw } from "../utils/drawsAPI";
import { getOperators, Operator } from "../utils/dashboardAPI";
import { BET_TYPES_CONFIG, BetType } from "../utils/games"; // On garde la config des types de paris
import { GameScreenAdvanced } from "./GameScreenAdvanced";

interface GameScreenProps {
  drawId: string;
  onBack: () => void;
  onNavigateToProfile: () => void;
  // Les soldes viendront du contexte, plus besoin de les passer en props
}

export function GameScreen({ drawId, onBack, onNavigateToProfile }: GameScreenProps) {
  const { user } = useAuth();
  const playBalance = user?.balanceGame ?? 0;

  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null);

  // NOUVEAU : États de chargement et d'erreur
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);
      setError(null);
      try {
        // On charge les détails du tirage et la liste des opérateurs en parallèle
        const [drawData, operatorsData] = await Promise.all([
          getDrawById(drawId),
          getOperators()
        ]);
        setDraw(drawData);
        setOperators(operatorsData);
      } catch (err) {
        console.error("Erreur chargement données du jeu:", err);
        setError("Impossible de charger les informations du tirage.");
        toast.error("Le tirage demandé est introuvable.");
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [drawId]);

  const getOperatorById = (id: string) => operators.find(op => op.id === id);

  // --- GESTION DES ÉTATS DE CHARGEMENT ET D'ERREUR ---

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !draw) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Tirage introuvable</h2>
          <p className="text-muted-foreground mb-4">{error || "Ce tirage n'existe pas ou n'est plus disponible."}</p>
          <Button onClick={onBack} className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">Retour</Button>
        </Card>
      </div>
    );
  }

  const operator = getOperatorById(draw.operatorId);
  if (!operator) {
     return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8"><p className="text-foreground">Données de l'opérateur introuvables</p><Button onClick={onBack} className="mt-4">Retour</Button></Card>
      </div>
    );
  }

  // Si un type de pari est sélectionné, on passe à l'écran avancé
  if (selectedBetType) {
    return (
      <GameScreenAdvanced
        drawId={drawId}
        betType={selectedBetType}
        onBack={() => setSelectedBetType(null)}
        onNavigateToProfile={onNavigateToProfile}
      />
    );
  }

  // --- AFFICHAGE PRINCIPAL (repris de votre ancien code) ---

  const drawDate = new Date(`${draw.date}T${draw.time}:00Z`);
  const now = new Date();
  const diff = drawDate.getTime() - now.getTime();
  
  let countdown = "Terminé";
  if (diff > 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    countdown = `${hours}h ${minutes}min`;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        balance={playBalance}
        onRecharge={() => setRechargeOpen(true)}
        onProfile={onNavigateToProfile}
      />
      <main className="container px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{operator.icon}</span>
            <div><h1 className="text-3xl font-bold text-foreground">{operator.name}</h1><p className="text-muted-foreground">{operator.country}</p></div>
          </div>
        </div>
        <Card className="mb-8 p-6 border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-[#FFD700]" /><div><p className="text-xs text-muted-foreground">Date</p><p className="font-semibold">{drawDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p></div></div>
            <div className="flex items-center gap-3"><Clock className="h-5 w-5 text-[#FF6B00]" /><div><p className="text-xs text-muted-foreground">Heure</p><p className="font-semibold">{draw.time}</p></div></div>
            <div><p className="text-xs text-muted-foreground">Temps restant</p><Badge className="bg-[#4F00BC]/20 text-[#4F00BC] border-[#4F00BC]/30">{countdown}</Badge></div>
          </div>
        </Card>
        <Card className="mb-8 p-4 bg-[#FFD700]/10 border-[#FFD700]/30">
          <div className="flex items-start gap-3"><Info className="h-5 w-5 text-[#FFD700] mt-0.5" /><div><p className="font-semibold text-foreground mb-1">Comment jouer ?</p><p className="text-sm text-muted-foreground">Choisissez votre type de pari ci-dessous. Chaque type offre des gains différents et nécessite un nombre de numéros spécifique.</p></div></div>
        </Card>
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Choisissez Votre Type de Pari</h2>
          <p className="text-muted-foreground mb-6">Sélectionnez le type de pari qui vous convient le mieux</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(BET_TYPES_CONFIG).map((betConfig) => {
              const multiplier = draw.multipliers?.[betConfig.id] ?? betConfig.defaultMultiplier;
              if (!multiplier) return null; // Ne pas afficher les types de pari non supportés par ce tirage

              return (
                <Card key={betConfig.id} className="p-6 border-2 border-border hover:border-[#FFD700] transition-all cursor-pointer group" onClick={() => setSelectedBetType(betConfig.id)}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{betConfig.icon}</span>
                    <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30">×{multiplier.toLocaleString()}</Badge>
                  </div>
                  <h3 className="font-bold text-lg text-foreground mb-2">{betConfig.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{betConfig.description}</p>
                  <Button className="w-full mt-4 bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90 group-hover:shadow-lg transition-all" onClick={(e) => { e.stopPropagation(); setSelectedBetType(betConfig.id); }}>Choisir</Button>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} balance={playBalance} onNavigateToResellers={() => {}}/>
    </div>
  );
}