import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { RechargeModal } from "./RechargeModal";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ArrowLeft, Sparkles, Calendar, Clock, Info, Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { motion } from "motion/react";
import { useAuth } from "../contexts/AuthContext";
import { createTicket as createTicketAPI, getDrawById, Draw } from "../utils/drawsAPI";
import { 
  getOperatorById,
  BetType, 
  BET_TYPES_CONFIG,
  calculatePermutationCombinations,
  generateNAP2Combinations,
  invertNumber,
} from "../utils/games";

interface GameScreenAdvancedProps {
  drawId: string;
  betType: BetType;
  onBack: () => void;
  onNavigateToProfile: () => void;
  playBalance?: number;
}

export function GameScreenAdvanced({ 
  drawId,
  betType,
  onBack, 
  onNavigateToProfile, 
  playBalance = 0, 
}: GameScreenAdvancedProps) {
  const { user, refreshUser } = useAuth();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [draw, setDraw] = useState<Draw | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [baseNumber, setBaseNumber] = useState<number | null>(null);
  const [associatedNumbers, setAssociatedNumbers] = useState<number[]>([]);
  const [position, setPosition] = useState<'first' | 'last'>('first');
  
  const [betAmount, setBetAmount] = useState<number>(100);
  const [customBetInput, setCustomBetInput] = useState<string>('');

  const betTypeConfig = BET_TYPES_CONFIG[betType];

  useEffect(() => {
    const loadDraw = async () => {
        setLoading(true);
        try {
            const loadedDraw = await getDrawById(drawId);
            setDraw(loadedDraw);
        } catch (error) {
            toast.error("Impossible de charger les informations du tirage.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    loadDraw();
  }, [drawId]);

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
  }

  if (!draw) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-foreground">Tirage introuvable</p>
          <Button onClick={onBack} className="mt-4">Retour</Button>
        </Card>
      </div>
    );
  }

  const operator = getOperatorById(draw.operatorId);
  if (!operator) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8">
          <p className="text-foreground">Opérateur introuvable</p>
          <Button onClick={onBack} className="mt-4">Retour</Button>
        </Card>
      </div>
    );
  }

  const multiplier = draw.multipliers?.[betType] ?? betTypeConfig.defaultMultiplier;
  const numbers = Array.from({ length: operator.numbersPool }, (_, i) => i + 1);

  const toggleNumber = (num: number) => {
    if (betType === 'BANKA') {
      if (baseNumber === num) {
        setBaseNumber(null);
      } else if (associatedNumbers.includes(num)) {
        setAssociatedNumbers(associatedNumbers.filter(n => n !== num));
      } else if (!baseNumber) {
        setBaseNumber(num);
      } else if (associatedNumbers.length < betTypeConfig.maxNumbers - 1) {
        setAssociatedNumbers([...associatedNumbers, num].sort((a, b) => a - b));
      } else {
        toast.error(`Maximum ${betTypeConfig.maxNumbers - 1} numéros associés`);
      }
    } else {
      if (selectedNumbers.includes(num)) {
        setSelectedNumbers(selectedNumbers.filter(n => n !== num));
      } else if (selectedNumbers.length < betTypeConfig.maxNumbers) {
        setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
      } else {
        toast.error(`Vous ne pouvez sélectionner que ${betTypeConfig.maxNumbers} numéro${betTypeConfig.maxNumbers > 1 ? 's' : ''}`);
      }
    }
  };

  const quickPick = () => {
    if (betType === 'BANKA') {
      const randomNumbers: number[] = [];
      while (randomNumbers.length < 3) {
        const num = Math.floor(Math.random() * operator.numbersPool) + 1;
        if (!randomNumbers.includes(num)) {
          randomNumbers.push(num);
        }
      }
      setBaseNumber(randomNumbers[0]);
      setAssociatedNumbers(randomNumbers.slice(1).sort((a, b) => a - b));
    } else {
      const randomNumbers: number[] = [];
      const count = betType === 'PERMUTATION' ? 4 : betTypeConfig.maxNumbers;
      while (randomNumbers.length < count) {
        const num = Math.floor(Math.random() * operator.numbersPool) + 1;
        if (!randomNumbers.includes(num)) {
          randomNumbers.push(num);
        }
      }
      setSelectedNumbers(randomNumbers.sort((a, b) => a - b));
    }
    toast.success('Sélection rapide effectuée !');
  };

  const getTotalCost = () => {
    if (betType === 'PERMUTATION') {
      const combinations = calculatePermutationCombinations(selectedNumbers.length);
      return combinations * betAmount;
    }
    return betAmount;
  };

  const getPotentialWin = () => {
    return betAmount * multiplier;
  };

  const quickBetAmounts = [100, 500, 1000, 5000, 10000];

  const handleBetAmountChange = (amount: number) => {
    setBetAmount(amount);
    setCustomBetInput(amount.toString());
  };

  const handleCustomBetChange = (value: string) => {
    setCustomBetInput(value);
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      setBetAmount(num);
    }
  };

  const handlePlaceBet = async () => {
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    if (betType === 'BANKA') {
      if (!baseNumber || associatedNumbers.length === 0) {
        toast.error("Sélectionnez un numéro de base et au moins un numéro associé");
        return;
      }
    } else if (betType === 'CHANCE_PLUS' || betType === 'ANAGRAMME') {
      if (selectedNumbers.length !== 1) {
        toast.error("Sélectionnez exactement 1 numéro");
        return;
      }
    } else {
      if (selectedNumbers.length < betTypeConfig.minNumbers || selectedNumbers.length > betTypeConfig.maxNumbers) {
        toast.error(`Sélectionnez entre ${betTypeConfig.minNumbers} et ${betTypeConfig.maxNumbers} numéros`);
        return;
      }
    }

    const totalCost = getTotalCost();
    if (totalCost > playBalance) {
      toast.error("Solde insuffisant");
      setRechargeOpen(true);
      return;
    }

    setSubmitting(true);

    try {
      let numbers = "";
      let combinations: number[][] | undefined;
      
      if (betType === 'BANKA') {
        numbers = `${baseNumber}, ${associatedNumbers.join(', ')}`;
      } else if (betType === 'PERMUTATION') {
        numbers = selectedNumbers.join(', ');
        combinations = generateNAP2Combinations(selectedNumbers);
      } else if (betType === 'CHANCE_PLUS') {
        numbers = selectedNumbers[0].toString();
      } else {
        numbers = selectedNumbers.join(', ');
      }

      const result = await createTicketAPI({
        drawId,
        betType,
        numbers,
        betAmount: totalCost,
        baseNumber: baseNumber ?? undefined,
        associatedNumbers: associatedNumbers.length > 0 ? associatedNumbers : undefined,
        position: betType === 'CHANCE_PLUS' ? position : undefined,
        combinations,
      });

      const operator = getOperatorById(draw.operatorId);
      toast.success(
        `Pari enregistré ! ${betTypeConfig.name} - ${operator?.name}`,
        {
          description: `Nouveau solde : ${result.newBalance.toLocaleString('fr-FR')} F`,
          duration: 4000,
        }
      );

      await refreshUser();

      setTimeout(() => {
        onNavigateToProfile();
      }, 1500);

    } catch (error: any) {
      console.error('Erreur création ticket:', error);
      toast.error(error.message || 'Erreur lors de la création du pari');
    } finally {
      setSubmitting(false);
    }
  };

  const drawDate = new Date(`${draw.date}T${draw.time}`);

  return (
    <div className="min-h-screen bg-background">
      <Header
        balance={playBalance}
        onRecharge={() => setRechargeOpen(true)}
        onProfile={onNavigateToProfile}
      />

      <main className="container px-3 sm:px-4 py-6 sm:py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>

          <div className="flex items-center gap-4">
            <span className="text-5xl">{operator.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {operator.name}
              </h1>
              <Badge className="bg-[#4F00BC]/20 text-[#4F00BC] border-[#4F00BC]/30">
                {betTypeConfig.name}
              </Badge>
            </div>
          </div>
        </div>

        <Card className="mb-6 p-4 border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{drawDate.toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{draw.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <span>Multiplicateur: ×{multiplier.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  Sélectionnez Vos Numéros
                </h2>
                <Button variant="outline" size="sm" onClick={quickPick}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Sélection Rapide
                </Button>
              </div>

              {betType === 'BANKA' && (
                <Card className="p-4 mb-4 bg-[#FFD700]/10 border-[#FFD700]/30">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-[#FFD700] mt-0.5" />
                    <div className="text-sm text-foreground">
                      <p className="font-semibold mb-1">Mode BANKA :</p>
                      <p>1. Sélectionnez d'abord votre numéro de base (surligné en or)</p>
                      <p>2. Ensuite, sélectionnez vos numéros associés</p>
                    </div>
                  </div>
                </Card>
              )}

              {betType === 'CHANCE_PLUS' && (
                <div className="mb-4">
                  <Label>Position</Label>
                  <Select value={position} onValueChange={(v: 'first' | 'last') => setPosition(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first">Premier numéro tiré</SelectItem>
                      <SelectItem value="last">Dernier numéro tiré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-9 sm:grid-cols-10 gap-2">
                {numbers.map(num => {
                  let isSelected = false;
                  let isBase = false;
                  
                  if (betType === 'BANKA') {
                    isBase = baseNumber === num;
                    isSelected = associatedNumbers.includes(num);
                  } else {
                    isSelected = selectedNumbers.includes(num);
                  }

                  const inverted = betType === 'ANAGRAMME' ? invertNumber(num) : null;
                  const showInverted = betType === 'ANAGRAMME' && inverted && inverted <= operator.numbersPool;

                  return (
                    <motion.button
                      key={num}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleNumber(num)}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg
                        transition-all duration-200 font-semibold text-sm
                        ${isBase 
                          ? 'bg-[#FFD700] text-[#121212] shadow-lg' 
                          : isSelected
                          ? 'bg-[#4F00BC] text-white shadow-lg'
                          : 'bg-muted text-foreground hover:bg-muted-foreground/20'
                        }
                      `}
                    >
                      <div className="text-center">
                        <div>{num}</div>
                        {showInverted && (
                          <div className="text-[10px] opacity-70">({inverted})</div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Récapitulatif</h3>

              <div className="mb-4">
                <Label className="text-sm text-muted-foreground">Numéros sélectionnés</Label>
                {betType === 'BANKA' ? (
                  <div className="mt-2">
                    {baseNumber && (
                      <Badge className="bg-[#FFD700]/20 text-[#FFD700] border-[#FFD700]/30 mr-2">
                        Base: {baseNumber}
                      </Badge>
                    )}
                    {associatedNumbers.length > 0 && (
                      <Badge className="bg-[#4F00BC]/20 text-[#4F00BC] border-[#4F00BC]/30">
                        {associatedNumbers.join(', ')}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-lg font-semibold text-[#FFD700] mt-2">
                    {selectedNumbers.length > 0 ? selectedNumbers.join(', ') : 'Aucun'}
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="mb-4">
                <Label>Mise par {betType === 'PERMUTATION' ? 'combinaison' : 'pari'}</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {quickBetAmounts.map(amount => (
                    <Button
                      key={amount}
                      variant={betAmount === amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleBetAmountChange(amount)}
                      className={betAmount === amount ? "bg-[#FFD700] text-[#121212]" : ""}
                    >
                      {amount >= 1000 ? `${amount / 1000}K` : amount}
                    </Button>
                  ))}
                </div>
                <Input
                  type="number"
                  placeholder="Mise personnalisée"
                  value={customBetInput}
                  onChange={(e) => handleCustomBetChange(e.target.value)}
                  className="mt-2"
                />
              </div>

              <Separator className="my-4" />

              {betType === 'PERMUTATION' && selectedNumbers.length >= 2 && (
                <div className="mb-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Combinaisons générées</p>
                  <p className="text-lg font-bold text-foreground">
                    {calculatePermutationCombinations(selectedNumbers.length)}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Coût Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {getTotalCost().toLocaleString()} F
                </p>
              </div>

              <div className="mb-6 p-4 bg-gradient-to-r from-[#FFD700]/20 to-[#FF6B00]/20 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Gain Potentiel</p>
                <p className="text-2xl font-bold text-[#FFD700]">
                  {getPotentialWin().toLocaleString()} F
                </p>
              </div>

              <Button
                className="w-full bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
                size="lg"
                onClick={handlePlaceBet}
                disabled={
                  submitting ||
                  (betType === 'BANKA' 
                    ? !baseNumber || associatedNumbers.length === 0
                    : selectedNumbers.length < betTypeConfig.minNumbers)
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  'Valider le Pari'
                )}
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      <RechargeModal
        open={rechargeOpen}
        onClose={() => setRechargeOpen(false)}
        balance={playBalance}
        onNavigateToResellers={() => {}}
      />
    </div>
  );
}
