import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useTheme } from "./ThemeProvider";
import { getCurrentUser, creditPlayerAccount, logoutUser } from "../utils/auth";
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  LogOut, 
  Search,
  ShoppingCart,
  MessageCircle,
  Phone
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner@2.0.3";
import { ResellerProfileSettings } from "./ResellerProfileSettings";

interface ResellerDashboardProps {
  onLogout: () => void;
}

export function ResellerDashboard({ onLogout }: ResellerDashboardProps) {
  const { actualTheme } = useTheme();
  const isDark = actualTheme === 'dark';
  
  const reseller = getCurrentUser();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [amount, setAmount] = useState('');
  const [buyTokensOpen, setBuyTokensOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  
  // Rafraîchir les données
  const [, setRefresh] = useState(0);
  const refreshData = () => setRefresh(prev => prev + 1);
  
  if (!reseller || reseller.role !== 'reseller') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Accès non autorisé</p>
      </div>
    );
  }
  
  const handleCreditAccount = () => {
    if (!searchTerm) {
      toast.error('Veuillez entrer un numéro de joueur');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Veuillez entrer un montant valide');
      return;
    }
    
    const result = creditPlayerAccount(searchTerm, parseFloat(amount));
    
    if (result.success) {
      toast.success(result.message);
      setSearchTerm('');
      setAmount('');
      refreshData();
      // Recharger pour mettre à jour les stats
      window.location.reload();
    } else {
      toast.error(result.message);
    }
  };
  
  const handleLogout = () => {
    logoutUser();
    toast.success('Déconnexion réussie !');
    onLogout();
  };
  
  const handleBuyTokens = () => {
    setBuyTokensOpen(true);
  };
  
  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(
      `Bonjour, je suis le revendeur ${reseller.username} et je souhaite acheter des jetons pour Lotto Happy.`
    );
    window.open(`https://wa.me/22890000000?text=${message}`, '_blank');
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundColor: isDark ? '#121212' : '#F4F4F7',
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b backdrop-blur"
        style={{
          backgroundColor: isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#d1d1d6',
        }}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo + Slogan */}
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF8800] shadow-lg">
              <span className="font-bold text-white text-sm">LH</span>
            </div>
            <div>
              <div className="font-bold text-foreground">Lotto Happy</div>
              <div className="text-xs text-muted-foreground">Espace Revendeurs</div>
            </div>
          </div>
          
          {/* Avatar Cliquable */}
          <button
            onClick={() => setProfileOpen(true)}
            className="flex items-center gap-2 rounded-full transition-all hover:opacity-80"
          >
            <Avatar className="h-10 w-10 border-2 border-[#FFD700] cursor-pointer">
              <AvatarFallback 
                className="font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FFD700 100%)',
                  color: '#FFFFFF',
                }}
              >
                {reseller.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Indicateurs Clés */}
        <div className="mb-6 sm:mb-8 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {/* Carte 1 : Solde de Jetons */}
          <Card 
            className="border-border bg-card p-4 sm:p-6"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)' 
                : 'linear-gradient(135deg, #FFFFFF 0%, #F9F9F9 100%)',
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Mon Solde de Jetons</p>
                <h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-[#FFD700]">
                  {(reseller.tokenBalance || 0).toLocaleString('fr-FR')} F
                </h2>
              </div>
              <div className="rounded-full bg-[#FFD700]/10 p-2 sm:p-3">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6 text-[#FFD700]" />
              </div>
            </div>
            <Button
              className="mt-3 sm:mt-4 w-full bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
              onClick={handleBuyTokens}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Acheter des Jetons
            </Button>
          </Card>

          {/* Carte 2 : Total Rechargé Aujourd'hui */}
          <Card className="border-border bg-card p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Rechargé Aujourd'hui</p>
                <h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-foreground">
                  {(reseller.dailyRechargeTotal || 0).toLocaleString('fr-FR')} F
                </h2>
              </div>
              <div className="rounded-full bg-[#34C759]/10 p-2 sm:p-3">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-[#34C759]" />
              </div>
            </div>
          </Card>

          {/* Carte 3 : Transactions Aujourd'hui */}
          <Card className="border-border bg-card p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Transactions Aujourd'hui</p>
                <h2 className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-foreground">
                  {reseller.dailyTransactionsCount || 0}
                </h2>
              </div>
              <div className="rounded-full bg-[#FF6B00]/10 p-2 sm:p-3">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-[#FF6B00]" />
              </div>
            </div>
          </Card>
        </div>

        {/* Outil de Rechargement */}
        <Card className="mb-8 border-border bg-card p-8">
          <h3 className="mb-6 text-2xl font-bold text-foreground">Recharger un Joueur</h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="search">Rechercher un joueur (Numéro ou Username)</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Ex: 22890123456 ou Username"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Montant à créditer (F CFA)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Ex: 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <Button
            className="mt-6 w-full bg-[#34C759] text-white hover:bg-[#34C759]/90"
            size="lg"
            onClick={handleCreditAccount}
          >
            Créditer le compte
          </Button>
        </Card>

        {/* Historique des Transactions */}
        <Card className="border-border bg-card p-6">
          <h3 className="mb-4 text-xl font-bold text-foreground">Transactions Récentes</h3>
          
          {!reseller.transactionHistory || reseller.transactionHistory.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Aucune transaction pour le moment
            </div>
          ) : (
            <div className="space-y-3">
              {reseller.transactionHistory.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                  style={{
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                  }}
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {transaction.playerUsername}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.playerNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#34C759]">
                      +{transaction.amount.toLocaleString('fr-FR')} F
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Modale Acheter des Jetons */}
      <Dialog open={buyTokensOpen} onOpenChange={setBuyTokensOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Acheter des Jetons</DialogTitle>
            <DialogDescription>
              Contactez l'administration de Lotto Happy pour acheter des jetons
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Pour recharger votre solde de jetons, veuillez contacter notre équipe administrative via les canaux ci-dessous :
            </p>
            
            <div className="space-y-3">
              <Button
                className="w-full bg-[#25D366] text-white hover:bg-[#25D366]/90"
                onClick={handleWhatsAppContact}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Contacter par WhatsApp
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('tel:+22890000000')}
              >
                <Phone className="mr-2 h-5 w-5" />
                Appeler le Support
              </Button>
            </div>
            
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="text-xs text-muted-foreground">
                <strong>Note :</strong> Les jetons achetés seront crédités sur votre compte après validation du paiement par l'administration.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modale Paramètres Profil */}
      <ResellerProfileSettings 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)}
        onLogout={onLogout}
      />
    </div>
  );
}