// src/components/ResellerDashboard.tsx

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { creditPlayerAccountAPI, findPlayerByPhoneAPI, getResellerHistoryAPI, FoundPlayer, RechargeHistoryItem } from "../utils/resellerAPI";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useTheme } from "./ThemeProvider";
import { Wallet, TrendingUp, Users, Search, ShoppingCart, MessageCircle, Phone, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";
import { ResellerProfileSettings } from "./ResellerProfileSettings";

interface ResellerDashboardProps {
  onLogout: () => void;
}

export function ResellerDashboard({ onLogout }: ResellerDashboardProps) {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  const { user: reseller, isLoading: isAuthLoading } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [foundPlayer, setFoundPlayer] = useState<FoundPlayer | null>(null);
  const [isFindingPlayer, setIsFindingPlayer] = useState(false);
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState<RechargeHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  
  const [buyTokensOpen, setBuyTokensOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effet pour rechercher le joueur quand le numéro de téléphone est tapé
  useEffect(() => {
    if (searchTerm.length >= 8) { // On cherche à partir de 8 chiffres
      const handler = setTimeout(async () => {
        setIsFindingPlayer(true);
        setFoundPlayer(null);
        try {
          // On doit ajouter l'indicatif s'il n'est pas là
          const fullPhoneNumber = searchTerm.startsWith('+') ? searchTerm : `+228${searchTerm}`;
          const player = await findPlayerByPhoneAPI(fullPhoneNumber);
          setFoundPlayer(player);
          toast.success(`Joueur trouvé : ${player.username}`);
        } catch (error) {
          setFoundPlayer(null);
        } finally {
          setIsFindingPlayer(false);
        }
      }, 500); // Délai de 500ms (debounce)
      return () => clearTimeout(handler);
    } else {
      setFoundPlayer(null);
    }
  }, [searchTerm]);
  
  // Effet pour charger l'historique au montage du composant
  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      try {
        const response = await getResellerHistoryAPI(0, 5); // On prend les 5 plus récents
        setHistory(response.items);
      } catch (error) {
        console.error("Erreur chargement historique:", error);
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isAuthLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!reseller || reseller.role !== 'reseller') {
    return <div className="flex min-h-screen items-center justify-center"><p className="text-muted-foreground">Accès non autorisé</p></div>;
  }
  
  const handleCreditAccount = async () => {
    if (!foundPlayer) return toast.error('Veuillez trouver un joueur valide avant de créditer.');
    if (!amount || parseFloat(amount) <= 0) return toast.error('Veuillez entrer un montant valide.');
    
    setIsSubmitting(true);
    try {
      const result = await creditPlayerAccountAPI(foundPlayer.phoneNumber, parseFloat(amount));
      toast.success(result.message || "Compte crédité avec succès !");
      setSearchTerm('');
      setAmount('');
      setFoundPlayer(null);
      // On recharge la page pour mettre à jour le solde du revendeur
      window.location.reload(); 
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors du crédit.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Bonjour, je suis le revendeur ${reseller.username} et je souhaite acheter des jetons pour Lotto Happy.`);
    window.open(`https://wa.me/22890000000?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: isDark ? '#121212' : '#F4F4F7' }}>
      <header className="sticky top-0 z-50 border-b backdrop-blur" style={{ backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)', borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6' }}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF8800] shadow-lg"><span className="font-bold text-white text-sm">LH</span></div>
            <div><div className="font-bold text-foreground">Lotto Happy</div><div className="text-xs text-muted-foreground">Espace Revendeurs</div></div>
          </div>
          <button onClick={() => setProfileOpen(true)} className="flex items-center gap-2 rounded-full transition-all hover:opacity-80">
            <Avatar className="h-10 w-10 border-2 border-[#FFD700] cursor-pointer"><AvatarFallback className="font-bold" style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)', color: '#FFFFFF' }}>{reseller.username.substring(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border bg-card p-4 sm:p-6" style={{ background: isDark ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F9F9F9 100%)' }}>
            <div className="flex items-start justify-between">
              <div><p className="text-xs sm:text-sm text-muted-foreground">Mon Solde de Jetons</p><h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-[#FFD700]">{(reseller.tokenBalance ?? 0).toLocaleString('fr-FR')} F</h2></div>
              <div className="rounded-full bg-[#FFD700]/10 p-2 sm:p-3"><Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFD700]" /></div>
            </div>
            <Button className="mt-3 sm:mt-4 w-full bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90" onClick={() => setBuyTokensOpen(true)}><ShoppingCart className="mr-2 h-4 w-4" />Acheter des Jetons</Button>
          </Card>
          {/* Les autres cartes de stats nécessiteront leurs propres appels API */}
        </div>
        <Card className="mb-8 border-border bg-card p-8">
          <h3 className="mb-6 text-2xl font-bold text-foreground">Recharger un Joueur</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher un joueur (Numéro)</Label>
              <div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" /><Input id="search" type="text" placeholder="Ex: 90123456" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />{isFindingPlayer && <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin"/>}</div>
              {foundPlayer && <p className="text-sm text-green-500">Joueur trouvé : <span className="font-bold">{foundPlayer.username}</span></p>}
            </div>
            <div className="space-y-2"><Label htmlFor="amount">Montant à créditer (F CFA)</Label><Input id="amount" type="number" placeholder="Ex: 5000" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          </div>
          <Button className="mt-6 w-full bg-[#34C759] text-white hover:bg-[#34C759]/90" size="lg" onClick={handleCreditAccount} disabled={isSubmitting || !foundPlayer}>{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Créditer le compte</Button>
        </Card>
        <Card className="border-border bg-card p-6">
          <h3 className="mb-4 text-xl font-bold text-foreground">Transactions Récentes</h3>
          {isHistoryLoading ? (<div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></div>) 
            : !history || history.length === 0 ? (<div className="py-8 text-center text-muted-foreground">Aucune transaction pour le moment</div>) 
            : (<div className="space-y-3">{history.map((tx) => (<div key={tx.id} className="flex items-center justify-between rounded-lg border border-border p-4" style={{ backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }}><div><p className="font-semibold text-foreground">{tx.playerCredited.username}</p><p className="text-sm text-muted-foreground">{tx.playerCredited.phoneNumber}</p></div><div className="text-right"><p className="font-bold text-[#34C759]">+{Math.abs(tx.amount).toLocaleString('fr-FR')} F</p><p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div></div>))}</div>)}
        </Card>
      </div>

      <Dialog open={buyTokensOpen} onOpenChange={setBuyTokensOpen}><DialogContent>{/* Contenu inchangé */}</DialogContent></Dialog>
      <ResellerProfileSettings open={profileOpen} onClose={() => setProfileOpen(false)} onLogout={onLogout} />
    </div>
  );
}