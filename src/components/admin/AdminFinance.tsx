import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { toast } from "sonner@2.0.3";
import { CheckCircle, XCircle, Wallet, Trophy, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { getTickets, getDraws } from "../../utils/draws";
import { getAllWithdrawalRequests, approveWithdrawalRequest, rejectWithdrawalRequest, MOBILE_MONEY_OPERATORS } from "../../utils/auth";

export function AdminFinance() {
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  // États pour les statistiques réelles
  const [stats, setStats] = useState({
    totalBets: 0,
    totalWinnings: 0,
    netProfit: 0,
    activePlayers: 0
  });

  // Charger les données réelles
  useEffect(() => {
    const loadData = () => {
      // 1. Charger les demandes de retrait depuis localStorage
      const loadWithdrawalRequests = () => {
        const requests = getAllWithdrawalRequests();
        // Transformer pour l'affichage
        const formattedRequests = requests.map(req => {
          const operator = MOBILE_MONEY_OPERATORS.find(op => op.id === req.provider);
          
          // IMPORTANT : Reconstituer le numéro complet avec l'indicatif pays
          // Le phoneNumber du joueur contient l'indicatif (ex: "22890123456")
          // Le withdrawalPhoneNumber est stocké SANS l'indicatif (ex: "90123456")
          // On prend les 3 premiers chiffres du phoneNumber comme indicatif
          const countryCode = req.phoneNumber.substring(0, 3); // "228"
          const fullWithdrawalPhone = countryCode + req.withdrawalPhoneNumber;
          
          return {
            id: req.id,
            playerName: req.username,
            playerNumber: req.phoneNumber,
            amount: req.amount,
            method: operator ? operator.name : req.provider,
            withdrawalPhone: fullWithdrawalPhone, // ✅ Numéro complet
            date: new Date(req.requestDate).toLocaleString('fr-FR'),
            status: req.status
          };
        });
        setWithdrawalRequests(formattedRequests);
      };

      loadWithdrawalRequests();
      
      // 2. Calculer les statistiques
      const allTickets = getTickets();
      const allDraws = getDraws();

      // Total des mises (tous les tickets) - CORRIGÉ : betAmount au lieu de betCost
      const totalBets = allTickets.reduce((sum, ticket) => sum + (ticket.betAmount || 0), 0);

      // Total des gains distribués (tickets gagnants)
      const totalWinnings = allTickets
        .filter(ticket => ticket.status === 'won')
        .reduce((sum, ticket) => sum + (ticket.winAmount || 0), 0);

      // Bénéfice net
      const netProfit = totalBets - totalWinnings;

      // Joueurs actifs (nombre unique de userId dans les tickets)
      const uniquePlayers = new Set(allTickets.map(ticket => ticket.userId));
      const activePlayers = uniquePlayers.size;

      setStats({
        totalBets,
        totalWinnings,
        netProfit,
        activePlayers
      });
    };

    loadData();
    
    // Rafraîchir toutes les 5 secondes
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = (request: any) => {
    setSelectedRequest(request);
    setShowApproveDialog(true);
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      approveWithdrawalRequest(selectedRequest.id);
      setWithdrawalRequests(withdrawalRequests.map(req =>
        req.id === selectedRequest.id ? { ...req, status: "approved" } : req
      ));
      toast.success(`✅ Retrait de ${selectedRequest.amount.toLocaleString('fr-FR')} F approuvé pour ${selectedRequest.playerName}`);
      setShowApproveDialog(false);
      setSelectedRequest(null);
    }
  };

  const confirmReject = () => {
    if (selectedRequest) {
      rejectWithdrawalRequest(selectedRequest.id);
      setWithdrawalRequests(withdrawalRequests.map(req =>
        req.id === selectedRequest.id ? { ...req, status: "rejected" } : req
      ));
      toast.error(`❌ Retrait de ${selectedRequest.amount.toLocaleString('fr-FR')} F rejeté pour ${selectedRequest.playerName}`);
      setShowRejectDialog(false);
      setSelectedRequest(null);
    }
  };

  // Filtrer par statut
  const pendingRequests = withdrawalRequests.filter(req => req.status === 'pending');
  const approvedRequests = withdrawalRequests.filter(req => req.status === 'approved');
  const rejectedRequests = withdrawalRequests.filter(req => req.status === 'rejected');

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion Financière</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Suivez les statistiques et approuvez les demandes de retrait
        </p>
      </div>

      {/* Statistiques Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <Card className="p-3 sm:p-4 md:p-6 border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 line-clamp-1">
                Total Mises
              </p>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground break-words">
                {stats.totalBets.toLocaleString('fr-FR')} F
              </p>
            </div>
            <div className="rounded-full bg-[#FF6B00]/10 p-1.5 sm:p-2 md:p-3 flex-shrink-0">
              <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#FF6B00]" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 md:p-6 border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 line-clamp-1">
                Gains Distribués
              </p>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground break-words">
                {stats.totalWinnings.toLocaleString('fr-FR')} F
              </p>
            </div>
            <div className="rounded-full bg-[#FFD700]/10 p-1.5 sm:p-2 md:p-3 flex-shrink-0">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#FFD700]" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 md:p-6 border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 line-clamp-1">
                Bénéfice Net
              </p>
              <p className={`text-sm sm:text-lg md:text-xl lg:text-2xl font-bold break-words ${stats.netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.netProfit.toLocaleString('fr-FR')} F
              </p>
            </div>
            <div className="rounded-full bg-green-500/10 p-1.5 sm:p-2 md:p-3 flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-500" />
            </div>
          </div>
        </Card>

        <Card className="p-3 sm:p-4 md:p-6 border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1 line-clamp-1">
                Joueurs Actifs
              </p>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-foreground">
                {stats.activePlayers}
              </p>
            </div>
            <div className="rounded-full bg-[#4F00BC]/10 p-1.5 sm:p-2 md:p-3 flex-shrink-0">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-[#4F00BC]" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4 sm:space-y-6">
        <div className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-3 bg-muted h-auto">
            <TabsTrigger 
              value="pending" 
              className="text-xs sm:text-sm py-2 px-3 sm:px-4 whitespace-nowrap flex-shrink-0"
            >
              En attente ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="approved" 
              className="text-xs sm:text-sm py-2 px-3 sm:px-4 whitespace-nowrap flex-shrink-0"
            >
              Approuvées ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="rejected" 
              className="text-xs sm:text-sm py-2 px-3 sm:px-4 whitespace-nowrap flex-shrink-0"
            >
              Rejetées ({rejectedRequests.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Demandes en attente */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? (
            <Card className="p-8 text-center border-border">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune demande de retrait en attente</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="p-6 border-border border-l-4 border-l-[#FF6B00]">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-foreground">{request.playerName}</h3>
                        <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30">
                          En attente
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant: </span>
                          <span className="font-semibold text-foreground">{request.amount.toLocaleString('fr-FR')} F</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Opérateur: </span>
                          <span className="font-semibold text-foreground">{request.method}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Numéro: </span>
                          <span className="font-semibold text-foreground">+{request.withdrawalPhone}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{request.date}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request)}
                        className="bg-green-500 text-white hover:bg-green-600"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approuver
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(request)}
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Rejeter
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Demandes approuvées */}
        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length === 0 ? (
            <Card className="p-8 text-center border-border">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune demande approuvée</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {approvedRequests.map((request) => (
                <Card key={request.id} className="p-6 border-border border-l-4 border-l-green-500">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-foreground">{request.playerName}</h3>
                        <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                          Approuvé
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant: </span>
                          <span className="font-semibold text-foreground">{request.amount.toLocaleString('fr-FR')} F</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Opérateur: </span>
                          <span className="font-semibold text-foreground">{request.method}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Numéro: </span>
                          <span className="font-semibold text-foreground">+{request.withdrawalPhone}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{request.date}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Demandes rejetées */}
        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length === 0 ? (
            <Card className="p-8 text-center border-border">
              <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Aucune demande rejetée</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedRequests.map((request) => (
                <Card key={request.id} className="p-6 border-border border-l-4 border-l-red-500">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-foreground">{request.playerName}</h3>
                        <Badge className="bg-red-500/20 text-red-500 border-red-500/30">
                          Rejeté
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Montant: </span>
                          <span className="font-semibold text-foreground">{request.amount.toLocaleString('fr-FR')} F</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Opérateur: </span>
                          <span className="font-semibold text-foreground">{request.method}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Numéro: </span>
                          <span className="font-semibold text-foreground">+{request.withdrawalPhone}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{request.date}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de confirmation d'approbation */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver le retrait</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir approuver le retrait de <strong>{selectedRequest?.amount.toLocaleString('fr-FR')} F</strong> pour <strong>{selectedRequest?.playerName}</strong> ?
              <br /><br />
              Cette action déclenchera le transfert vers <strong>{selectedRequest?.method}</strong> au numéro <strong>+{selectedRequest?.withdrawalPhone}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmApprove} className="bg-green-500 hover:bg-green-600">
              Approuver
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation de rejet */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter le retrait</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir rejeter le retrait de <strong>{selectedRequest?.amount.toLocaleString('fr-FR')} F</strong> pour <strong>{selectedRequest?.playerName}</strong> ?
              <br /><br />
              Le montant restera sur le compte du joueur.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReject} className="bg-red-500 hover:bg-red-600">
              Rejeter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}