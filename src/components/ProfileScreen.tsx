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
import { getPlayerTransactionHistory, PlayerTransaction, changePassword as apiChangePassword } from "../utils/authAPI";
import { createWithdrawalRequest } from "../utils/withdrawalsAPI";
import { 
  ArrowLeft, 
  Trophy, 
  User, 
  Bell, 
  Lock, 
  Smartphone, 
  Eye, 
  EyeOff,
  ArrowRightLeft,
  QrCode,
  Palette,
  Sun,
  Moon,
  Monitor,
  LogOut,
  TrendingUp,
  TrendingDown,
  Repeat,
  Wallet
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner@2.0.3";

interface ProfileScreenProps {
  onBack: () => void;
  playBalance?: number;
  winningsBalance?: number;
  onRecharge?: (amount: number) => void;
  onConvertWinnings?: (amount: number) => boolean;
}

export function ProfileScreen({ onBack, playBalance, winningsBalance, onRecharge, onConvertWinnings }: ProfileScreenProps) {
  const { user, logout, refreshUser } = useAuth();
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transactions, setTransactions] = useState<PlayerTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const [devicesModalOpen, setDevicesModalOpen] = useState(false);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [twoFactorCode, setTwoFactorCode] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        setLoadingTransactions(true);
        try {
          const history = await getPlayerTransactionHistory();
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

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      await apiChangePassword(oldPassword, newPassword);
      toast.success('Mot de passe modifié avec succès !');
      setPasswordModalOpen(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    }
  };
  
  const handleActivate2FA = () => {
    if (twoFactorCode.length !== 6) {
      toast.error('Veuillez entrer le code à 6 chiffres');
      return;
    }
    
    toast.success('Authentification à deux facteurs activée !');
    setTwoFactorModalOpen(false);
    setTwoFactorCode('');
  };
  
  const handleDisconnectDevice = (deviceName: string) => {
    toast.success(`Déconnecté de ${deviceName}`);
  };
  
  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie ! À bientôt 👋');
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
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        balance={playBalance}
        onRecharge={() => setRechargeOpen(true)} 
        onProfile={() => {}} 
      />

      <main className="container px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 hover:bg-accent/10"
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card className="mb-8 border-border bg-card p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="h-24 w-24 ring-4 ring-[#FFD700]/20">
              <AvatarImage src="https://avatar.vercel.sh/user" alt="Profile" />
              <AvatarFallback className="gradient-gold text-2xl text-[#121212]">
                {user?.username?.substring(0, 2).toUpperCase() || 'KA'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-foreground">
                {user?.username || 'Utilisateur'}
              </h1>
              <p className="text-muted-foreground">
                {user?.phoneNumber || '+228 90 12 34 56'}
              </p>
              <div className="mt-2 flex items-center justify-center gap-2 sm:justify-start">
                <Badge className="bg-gradient-gold text-white">
                  <Trophy className="mr-1 h-3 w-3 text-white" />
                  Membre Or
                </Badge>
                <Badge className="bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90">
                  Niveau 5
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center rounded-lg border-2 border-[#FFD700] bg-[#FFD700]/10 p-2 sm:p-3 md:p-4">
                <p className="text-base sm:text-xl md:text-2xl font-bold text-[#FFD700] break-words">
                  {playBalance?.toLocaleString('fr-FR') || 0} F
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Solde de Jeu</p>
              </div>
              <div className="text-center rounded-lg border-2 border-[#34C759] bg-[#34C759]/10 p-2 sm:p-3 md:p-4">
                <p className="text-base sm:text-xl md:text-2xl font-bold text-[#34C759] break-words">
                  {winningsBalance?.toLocaleString('fr-FR') || 0} F
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Solde des Gains</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 flex flex-col xs:flex-row justify-center gap-2 sm:gap-3">
            <Button
              className="bg-[#34C759] text-white hover:bg-[#34C759]/90 text-xs sm:text-sm px-3 sm:px-4"
              onClick={() => setConvertOpen(true)}
            >
              <ArrowRightLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Convertir mes gains
            </Button>
            <Button
              className="bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90 text-xs sm:text-sm px-3 sm:px-4"
              onClick={() => setWithdrawOpen(true)}
            >
              <Wallet className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Retirer mon argent
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="bets" className="space-y-4 sm:space-y-6">
          <div className="w-full overflow-x-auto scrollbar-visible -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-3 bg-muted h-auto">
              <TabsTrigger 
                value="bets" 
                className="text-xs sm:text-sm py-2 px-3 sm:px-4 whitespace-nowrap flex-shrink-0"
              >
                Paris
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="text-xs sm:text-sm py-2 px-3 sm:px-4 whitespace-nowrap flex-shrink-0"
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="text-xs sm:text-sm py-2 px-3 sm:px-4 whitespace-nowrap flex-shrink-0"
              >
                Paramètres
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bets" className="space-y-4">
            {user?.id ? (
              <BetHistory userId={user.id} />
            ) : (
              <Card className="border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">Vous devez être connecté pour voir vos paris</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {loadingTransactions ? <p>Chargement...</p> : transactions.length === 0 ? (
              <Card className="border-border bg-card p-8">
                <div className="text-center text-muted-foreground">
                  <p className="mb-2">📊 Aucune transaction pour le moment</p>
                  <p className="text-sm">Vos transactions apparaîtront ici</p>
                </div>
              </Card>
            ) : (
              transactions.map((transaction) => {
                let Icon = Repeat;
                let iconColor = 'text-muted-foreground';
                let bgColor = 'bg-muted';
                
                if (transaction.type === 'RECHARGE') {
                  Icon = TrendingUp;
                  iconColor = 'text-[#34C759]';
                  bgColor = 'bg-[#34C759]/10';
                } else if (transaction.type === 'BET') {
                  Icon = TrendingDown;
                  iconColor = 'text-[#FF6B00]';
                  bgColor = 'bg-[#FF6B00]/10';
                } else if (transaction.type === 'CONVERSION') {
                  Icon = Repeat;
                  iconColor = 'text-[#FFD700]';
                  bgColor = 'bg-[#FFD700]/10';
                } else if (transaction.type === 'WIN') {
                  Icon = Trophy;
                  iconColor = 'text-[#34C759]';
                  bgColor = 'bg-[#34C759]/10';
                } else if (transaction.type === 'WITHDRAWAL') {
                  Icon = Wallet;
                  iconColor = 'text-[#FF6B00]';
                  bgColor = 'bg-[#FF6B00]/10';
                }
                
                const transactionDate = new Date(transaction.date);
                const formattedDate = transactionDate.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                
                return (
                  <Card key={transaction.id} className="border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2 ${bgColor}`}>
                          <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {transaction.description}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {formattedDate}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${transaction.amount >= 0 ? 'text-[#34C759]' : 'text-foreground'}`}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toLocaleString('fr-FR')} F
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Solde : {transaction.balanceAfter.toLocaleString('fr-FR')} F
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <User className="h-5 w-5" />
                Informations du compte
              </h3>
              <div className="space-y-4">
                <div>
                  <Label>Nom d'utilisateur</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.username || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <Label>Numéro de téléphone</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.phoneNumber || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <Label>Adresse email</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || 'Non renseignée'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Bell className="h-5 w-5" />
                Notifications
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notifications">Notifications push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des alertes pour les tirages et gains
                    </p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notifications email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevez des résumés hebdomadaires
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Lock className="h-5 w-5" />
                Sécurité
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto min-h-[40px] whitespace-normal text-left" onClick={() => setPasswordModalOpen(true)}>
                  Changer le mot de passe
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto min-h-[40px] whitespace-normal text-left py-2" onClick={() => setTwoFactorModalOpen(true)}>
                  Activer l'authentification à deux facteurs
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto min-h-[40px] whitespace-normal text-left" onClick={() => setDevicesModalOpen(true)}>
                  Gérer les appareils connectés
                </Button>
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <Palette className="h-5 w-5" />
                Apparence
              </h3>
              <div className="space-y-4">
                <Label className="text-foreground">Choisissez votre thème</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Personnalisez l'apparence de l'application selon vos préférences
                </p>
                
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 ${
                      theme === 'light'
                        ? 'border-[#FFD700] bg-[#FFD700]/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500]">
                      <Sun className="h-6 w-6 text-[#121212]" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Clair</p>
                      <p className="text-xs text-muted-foreground">Lumineux et accueillant</p>
                    </div>
                    {theme === 'light' && (
                      <div className="mt-1 h-1 w-full rounded-full bg-[#FFD700]" />
                    )}
                  </button>

                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 ${
                      theme === 'dark'
                        ? 'border-[#FFD700] bg-[#FFD700]/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4F00BC] to-[#2D006B]">
                      <Moon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Sombre</p>
                      <p className="text-xs text-muted-foreground">Confort pour vos yeux</p>
                    </div>
                    {theme === 'dark' && (
                      <div className="mt-1 h-1 w-full rounded-full bg-[#FFD700]" />
                    )}
                  </button>

                  <button
                    onClick={() => setTheme('auto')}
                    className={`flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 ${
                      theme === 'auto'
                        ? 'border-[#FFD700] bg-[#FFD700]/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8800]">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Automatique</p>
                      <p className="text-xs text-muted-foreground">Suit votre système</p>
                    </div>
                    {theme === 'auto' && (
                      <div className="mt-1 h-1 w-full rounded-full bg-[#FFD700]" />
                    )}
                  </button>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    💡 <strong>Conseil :</strong> Le thème automatique s'adapte aux préférences de votre appareil.
                    {theme === 'auto' && ' Actuellement : ' + (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Sombre' : 'Clair')}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border-border bg-card p-6">
              <h3 className="mb-4 flex items-center gap-2 font-semibold text-foreground">
                <LogOut className="h-5 w-5" />
                Déconnexion
              </h3>
              <div className="space-y-4">
                <Button
                  className="bg-[#FF3B30] text-white hover:bg-[#FF3B30]/90"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      <RechargeModal 
        open={rechargeOpen} 
        onClose={() => setRechargeOpen(false)}
        balance={playBalance || 0}
        onNavigateToResellers={() => {}}
      />

      <ConvertModal
        open={convertOpen}
        onClose={() => setConvertOpen(false)}
        winningsBalance={winningsBalance || 0}
        onConvert={onConvertWinnings || (() => false)}
      />

      <WithdrawModal
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        currentBalance={playBalance || 0}
        onWithdraw={handleWithdraw}
      />

      <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Changer votre mot de passe</DialogTitle>
            <DialogDescription>
              Saisissez votre ancien mot de passe et choisissez-en un nouveau.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">Ancien mot de passe</Label>
              <div className="relative">
                <Input
                  id="old-password"
                  type={showOldPassword ? 'text' : 'password'}
                  placeholder="Entrez votre ancien mot de passe"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">Nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Entrez votre nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Retapez votre nouveau mot de passe"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setPasswordModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
              onClick={handleChangePassword}
            >
              Enregistrer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={twoFactorModalOpen} onOpenChange={setTwoFactorModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Activer l'authentification à deux facteurs</DialogTitle>
            <DialogDescription>
              Scannez le QR code avec votre application d'authentification et entrez le code de vérification.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex justify-center">
              <div className="rounded-xl border-2 border-dashed border-border bg-muted p-8 text-center">
                <QrCode className="mx-auto h-32 w-32 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">
                  QR Code d'authentification
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="two-factor-code">Code de vérification</Label>
              <Input
                id="two-factor-code"
                type="text"
                placeholder="Entrez le code à 6 chiffres"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-muted-foreground text-center">
                Entrez les 6 chiffres affichés dans votre application d'authentification
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setTwoFactorModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
              onClick={handleActivate2FA}
            >
              Activer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={devicesModalOpen} onOpenChange={setDevicesModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Appareils Connectés</DialogTitle>
            <DialogDescription>
              Gérez les appareils qui ont accès à votre compte Loto Happy.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Card className="border-[#FFD700] bg-card/50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-[#FFD700]/10 p-2">
                  <Smartphone className="h-5 w-5 text-[#FFD700]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">Chrome sur Windows</p>
                    <Badge className="bg-[#34C759] text-white">Actif maintenant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Lomé, Togo</p>
                  <p className="text-xs text-muted-foreground mt-1">Dernière activité : Il y a quelques secondes</p>
                </div>
              </div>
            </Card>
            
            <Card className="border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">iPhone 14 Pro</p>
                    <p className="text-sm text-muted-foreground">Lomé, Togo</p>
                    <p className="text-xs text-muted-foreground mt-1">Dernière activité : Il y a 2 heures</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/10"
                  onClick={() => handleDisconnectDevice('iPhone 14 Pro')}
                >
                  Se déconnecter
                </Button>
              </div>
            </Card>
            
            <Card className="border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-muted p-2">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Safari sur iPad</p>
                    <p className="text-sm text-muted-foreground">Cotonou, Bénin</p>
                    <p className="text-xs text-muted-foreground mt-1">Dernière activité : Il y a 3 jours</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#FF3B30] text-[#FF3B30] hover:bg-[#FF3B30]/10"
                  onClick={() => handleDisconnectDevice('Safari sur iPad')}
                >
                  Se déconnecter
                </Button>
              </div>
            </Card>
          </div>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setDevicesModalOpen(false)}
          >
            Fermer
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}