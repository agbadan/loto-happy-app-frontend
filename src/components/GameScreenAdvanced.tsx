// src/components/GameScreenAdvanced.tsx

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { RechargeModal } from "./RechargeModal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ArrowLeft, Sparkles, Calendar, Clock, Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
// NOUVEAUX IMPORTS API
import { getDrawById, createTicket, Draw } from "../utils/drawsAPI";
import { getOperators, Operator } from "../utils/dashboardAPI";
import { BetType, BET_TYPES_CONFIG, calculatePermutationCombinations } from "../utils/games";

interface GameScreenAdvancedProps {
  drawId: string;
  betType: BetType;
  onBack: () => void;
  onNavigateToProfile: () => void;
}

export function GameScreenAdvanced({ 
  drawId,
  betType,
  onBack, 
  onNavigateToProfile, 
}: GameScreenAdvancedProps) {
  const { user, refreshUser } = useAuth();
  const playBalance = user?.balanceGame ?? 0;

  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [operator, setOperator] = useState<Operator | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [customBetInput, setCustomBetInput] = useState<string>('100');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const betTypeConfig = BET_TYPES_CONFIG[betType];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [drawData, operatorsData] = await Promise.all([
          getDrawById(drawId),
          getOperators()
        ]);
        const currentOperator = operatorsData.find(op => op.id === drawData.operatorId);

        if (!currentOperator) {
          throw new Error("Opérateur pour ce tirage introuvable.");
        }
        
        setDraw(drawData);
        setOperator(currentOperator);
      } catch (error) {
        console.error("Erreur de chargement pour GameScreenAdvanced:", error);
        toast.error("Impossible de charger les détails du jeu.");
        onBack(); // Revenir en arrière si les données ne peuvent pas être chargées
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [drawId, onBack]);

  if (loading || !draw || !operator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const multiplier = draw.multipliers?.[betType] ?? betTypeConfig.defaultMultiplier;
  const numbers = Array.from({ length: operator.numbersPool }, (_, i) => i + 1);

  const toggleNumber = (num: number) => {
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter(n => n !== num));
    } else if (selectedNumbers.length < betTypeConfig.maxNumbers) {
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    } else {
      toast.error(`Maximum ${betTypeConfig.maxNumbers} numéros pour ce type de pari.`);
    }
  };

  const quickPick = () => {
    const randomNumbers: number[] = [];
    const count = betTypeConfig.minNumbers; // Sélectionne le minimum requis
    while (randomNumbers.length < count) {
      const num = Math.floor(Math.random() * operator.numbersPool) + 1;
      if (!randomNumbers.includes(num)) {
        randomNumbers.push(num);
      }
    }
    setSelectedNumbers(randomNumbers.sort((a, b) => a - b));
    toast.success('Sélection rapide effectuée !');
  };

  const getTotalCost = () => {
    if (betType === 'PERMUTATION') {
      const combinations = calculatePermutationCombinations(selectedNumbers.length);
      return combinations * betAmount;
    }
    return betAmount;
  };
  const totalCost = getTotalCost();
  const potentialWin = betAmount * multiplier;

  const handlePlaceBet = async () => {
    if (selectedNumbers.length < betTypeConfig.minNumbers) {
      toast.error(`Veuillez sélectionner au moins ${betTypeConfig.minNumbers} numéro(s).`);
      return;
    }
    if (totalCost > playBalance) {
      toast.error("Solde de jeu insuffisant.");
      setRechargeOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await createTicket({
        drawId: draw.id,
        betType: betType,
        numbers: selectedNumbers.join(','),
        betAmount: totalCost,
      });

      toast.success(`Pari de ${totalCost.toLocaleString('fr-FR')} F placé avec succès !`);
      await refreshUser(); // Rafraîchir le solde de l'utilisateur
      setTimeout(onBack, 1000); // Revenir à l'écran précédent après un court délai

    } catch (error) {
      console.error("Erreur lors du placement du pari:", error);
      toast.error("Une erreur est survenue. Votre pari n'a pas été placé.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header balance={playBalance} onRecharge={() => setRechargeOpen(true)} onProfile={onNavigateToProfile}/>
      <main className="container px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Retour</Button>
          <div className="flex items-center gap-4"><span className="text-5xl">{operator.icon}</span><div><h1 className="text-3xl font-bold text-foreground">{operator.name}</h1><Badge className="bg-[#4F00BC]/20 text-[#4F00BC] border-[#4F00BC]/30">{betTypeConfig.name}</Badge></div></div>
        </div>
        <Card className="mb-6 p-4 border-border"><div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{new Date(`${draw.date}T00:00:00Z`).toLocaleDateString('fr-FR')}</span></div><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /><span>{draw.time}</span></div><div className="flex items-center gap-2"><Calculator className="h-4 w-4 text-muted-foreground" /><span>Multiplicateur: ×{multiplier.toLocaleString()}</span></div></div></Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-foreground">Sélectionnez Vos Numéros</h2><Button variant="outline" size="sm" onClick={quickPick}><Sparkles className="mr-2 h-4 w-4" />Sélection Rapide</Button></div>
              <p className="text-sm text-muted-foreground mb-4">Choisissez {betTypeConfig.minNumbers === betTypeConfig.maxNumbers ? betTypeConfig.minNumbers : `${betTypeConfig.minNumbers} à ${betTypeConfig.maxNumbers}`} numéro(s).</p>
              <div className="grid grid-cols-9 sm:grid-cols-10 gap-2">
                {numbers.map(num => (
                  <motion.button key={num} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => toggleNumber(num)} className={`aspect-square flex items-center justify-center rounded-lg transition-all duration-200 font-semibold text-sm ${selectedNumbers.includes(num) ? 'bg-yellow-500 text-black shadow-lg' : 'bg-muted text-foreground hover:bg-muted-foreground/20'}`}>
                    {num}
                  </motion.button>
                ))}
              </div>
            </Card>
          </div>
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Récapitulatif</h3>
              <div className="mb-4"><Label className="text-sm text-muted-foreground">Numéros sélectionnés</Label><p className="text-lg font-semibold text-yellow-500 mt-2">{selectedNumbers.length > 0 ? selectedNumbers.join(', ') : 'Aucun'}</p></div>
              <Separator className="my-4" />
              <div className="mb-4">
                <Label>Mise par {betType === 'PERMUTATION' ? 'combinaison' : 'pari'}</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[100, 500, 1000].map(amount => (<Button key={amount} variant={betAmount === amount ? "default" : "outline"} size="sm" onClick={() => { setBetAmount(amount); setCustomBetInput(String(amount)); }} className={betAmount === amount ? "bg-yellow-500 text-black" : ""}>{amount >= 1000 ? `${amount / 1000}K` : amount}</Button>))}
                </div>
                <Input type="number" placeholder="Mise personnalisée" value={customBetInput} onChange={(e) => { setCustomBetInput(e.target.value); const num = parseInt(e.target.value); if (!isNaN(num) && num >= 0) setBetAmount(num); }} className="mt-2"/>
              </div>
              <Separator className="my-4" />
              {betType === 'PERMUTATION' && selectedNumbers.length >= 2 && (<div className="mb-4 p-3 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Combinaisons générées</p><p className="text-lg font-bold text-foreground">{calculatePermutationCombinations(selectedNumbers.length)}</p></div>)}
              <div className="mb-4"><p className="text-sm text-muted-foreground">Coût Total</p><p className="text-2xl font-bold text-foreground">{totalCost.toLocaleString('fr-FR')} F</p></div>
              <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg"><p className="text-sm text-muted-foreground mb-1">Gain Potentiel</p><p className="text-2xl font-bold text-yellow-500">{potentialWin.toLocaleString('fr-FR')} F</p></div>
              <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-600" size="lg" onClick={handlePlaceBet} disabled={isSubmitting || selectedNumbers.length < betTypeConfig.minNumbers}>{isSubmitting ? <Loader2 className="animate-spin" /> : 'Valider le Pari'}</Button>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} balance={playBalance} onNavigateToResellers={() => {}}/>
    </div>
  );
}