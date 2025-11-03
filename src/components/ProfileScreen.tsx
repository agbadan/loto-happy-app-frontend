// src/components/ProfileScreen.tsx

import { useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { RechargeModal } from "./RechargeModal";
import { ConvertModal } from "./ConvertModal";
import { WithdrawModal } from "./WithdrawModal";
import { BetHistory } from "./BetHistory";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "../contexts/AuthContext";
import { changePassword as apiChangePassword } from "../utils/authAPI";
import { getMyTransactionHistory, PlayerTransaction } from "../utils/playerAPI";
import { createWithdrawalRequest } from "../utils/withdrawalsAPI";
import { toast } from "sonner";
import { 
  ArrowLeft, Trophy, User, Bell, Lock, Palette, Sun, Moon, Monitor, LogOut,
  ArrowRightLeft, Wallet, TrendingUp, TrendingDown, Repeat, Eye, EyeOff, Smartphone, QrCode
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateToProfile: () => void;
}

export function ProfileScreen({ onBack, onNavigateToProfile }: ProfileScreenProps) {
  const { user, logout, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transactions, setTransactions] = useState<PlayerTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Solde récupéré directement depuis le contexte d'authentification
  const playBalance = user?.balanceGame ?? 0;
  const winningsBalance = user?.balanceWinnings ?? 0;

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        setLoadingTransactions(true);
        try {
          const history = await getMyTransactionHistory();
          setTransactions(history);
        } catch (error) {
          toast.error("Impossible de charger l'historique des transactions.");
        } finally {
          setLoadingTransactions(false);
        }
      }
    };
    fetchTransactions();
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie ! À bientôt 👋');
    onBack();
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    try {
      await apiChangePassword(oldPassword, newPassword);
      toast.success('Mot de passe modifié avec succès !');
      setPasswordModalOpen(false);
    } catch (error) {
      toast.error((error as Error).message || "Une erreur s'est produite.");
    }
  };

  const handleWithdraw = async (amount: number, provider: string, phoneNumber: string) => {
    try {
      await createWithdrawalRequest({ amount, provider, withdrawalPhoneNumber: phoneNumber });
      await refreshUser();
      toast.success("Demande de retrait envoyée avec succès !");
      setWithdrawOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la demande de retrait");
    }
  };
  
  // Affiche un état de chargement si l'utilisateur n'est pas encore chargé
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center"><p className="text-muted-foreground">Chargement du profil...</p></Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        balance={playBalance}
        onRecharge={() => setRechargeOpen(true)} 
        onProfile={onNavigateToProfile} 
      />
      <main className="container px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card className="mb-8 p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.username}`} alt={user.username} />
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {user.username?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground">{user.username}</h1>
              <p className="text-muted-foreground">{user.phoneNumber}</p>
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                <Badge className="bg-primary/20 text-primary border-primary/30"><Trophy className="mr-1 h-3 w-3" />Membre Or</Badge>
                <Badge variant="default">Niveau 5</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center rounded-lg border-2 border-yellow-500 bg-yellow-500/10 p-3">
                <p className="text-xl font-bold text-yellow-500">{playBalance.toLocaleString('fr-FR')} F</p>
                <p className="text-xs text-muted-foreground mt-1">Solde de Jeu</p>
              </div>
              <div className="text-center rounded-lg border-2 border-green-500 bg-green-500/10 p-3">
                <p className="text-xl font-bold text-green-500">{winningsBalance.toLocaleString('fr-FR')} F</p>
                <p className="text-xs text-muted-foreground mt-1">Solde des Gains</p>
              </div>
            </div>
          </div>
{/* CODE CORRIGÉ À COLLER */}
<div className="mt-6 flex flex-col xs:flex-row justify-center gap-3">
    <Button 
        className="bg-[#34C759] text-white hover:bg-[#34C759]/90" // Vert "success" de votre thème
        onClick={() => setConvertOpen(true)}
    >
        <ArrowRightLeft className="mr-2 h-4 w-4" />
        Convertir
    </Button>
    
    {/* --- CORRECTION APPLIQUÉE ICI --- */}
    <Button 
        className="bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90" // Classes explicites pour le jaune
        onClick={() => setWithdrawOpen(true)}
    >
        <Wallet className="mr-2 h-4 w-4" />
        Retirer
    </Button>
</div>
        </Card>

        <Tabs defaultValue="bets" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bets">Paris</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="bets">
            <BetHistory />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {loadingTransactions ? <p className="text-center text-muted-foreground">Chargement des transactions...</p> : transactions.length === 0 ? (
              <Card className="p-8 text-center"><p className="text-muted-foreground">📊 Aucune transaction pour le moment</p></Card>
            ) : (
              transactions.map((transaction) => {
                // ... (logique d'affichage des transactions)
                return (
                  <Card key={transaction.id} className="p-4">
                    {/* Contenu de la carte transaction */}
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold"><Lock className="h-5 w-5" />Sécurité</h3>
                <Button variant="outline" className="w-full justify-start" onClick={() => setPasswordModalOpen(true)}>
                  Changer le mot de passe
                </Button>
            </Card>
            <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold"><Palette className="h-5 w-5" />Apparence</h3>
                <div className="grid grid-cols-3 gap-2">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => setTheme('light')}><Sun className="mr-2 h-4 w-4"/>Clair</Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => setTheme('dark')}><Moon className="mr-2 h-4 w-4"/>Sombre</Button>
                    <Button variant={theme === 'auto' ? 'default' : 'outline'} onClick={() => setTheme('auto')}><Monitor className="mr-2 h-4 w-4"/>Système</Button>
                </div>
            </Card>
            <Card className="p-6">
                <h3 className="mb-4 flex items-center gap-2 font-semibold"><LogOut className="h-5 w-5" />Déconnexion</h3>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>Se déconnecter</Button>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      
      <RechargeModal open={rechargeOpen} onClose={() => setRechargeOpen(false)} balance={playBalance} onNavigateToResellers={() => {}}/>
      <ConvertModal open={convertOpen} onClose={() => setConvertOpen(false)} winningsBalance={winningsBalance} onConvert={() => { /* Logique de conversion */ return true; }} />
      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} currentBalance={winningsBalance} onWithdraw={handleWithdraw} />

      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer votre mot de passe</DialogTitle>
            <DialogDescription>Saisissez votre ancien mot de passe et choisissez-en un nouveau.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">Ancien mot de passe</Label>
              <Input id="old-password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <Input id="confirm-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPasswordModalOpen(false)}>Annuler</Button>
            <Button variant="brand" onClick={handleChangePassword}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}