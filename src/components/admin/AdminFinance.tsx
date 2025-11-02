// Version finale - forçage du cache 2
import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { CheckCircle, XCircle, Wallet, Trophy, DollarSign, Users, Loader2, TrendingUp } from "lucide-react";
import { getGlobalFinancialStats, getWithdrawals, processWithdrawalRequest } from "../../utils/withdrawalsAPI";
import { Withdrawal, FinancialStats } from "../../types";

const StatCard = ({ title, value, icon: Icon, iconBg, iconColor, isCurrency = true, profitColor = false }: { title: string, value: number, icon: React.ElementType, iconBg: string, iconColor: string, isCurrency?: boolean, profitColor?: boolean }) => (
    <Card className="p-4 md:p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">{title}</p><p className={`text-2xl font-bold ${profitColor ? (value >= 0 ? 'text-green-500' : 'text-red-500') : ''}`}>{isCurrency ? value.toLocaleString('fr-FR') + ' F' : value.toLocaleString('fr-FR')}</p></div><div className={`rounded-full p-3 ${iconBg}`}><Icon className={`h-6 w-6 ${iconColor}`} /></div></div></Card>
);

const WithdrawalCard = ({ request, onApprove, onReject }: { request: Withdrawal, onApprove: (req: Withdrawal) => void, onReject: (req: Withdrawal) => void }) => {
    const statusConfig = { pending: { color: 'yellow-500', text: 'En attente' }, approved: { color: 'green-500', text: 'Approuvé' }, rejected: { color: 'red-500', text: 'Rejeté' }};
    const currentStatus = request.status as keyof typeof statusConfig;

    return (
        <Card key={request.id} className={`p-6 border-l-4 border-l-${statusConfig[currentStatus]?.color || 'gray-500'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg">{request.playerInfo?.username || 'Utilisateur inconnu'}</h3>
                        <Badge className={`bg-${statusConfig[currentStatus]?.color}/20 text-${statusConfig[currentStatus]?.color}`}>{statusConfig[currentStatus]?.text || 'Inconnu'}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 text-sm mt-2">
                        <span>Montant: <span className="font-semibold">{request.amount.toLocaleString('fr-FR')} F</span></span>
                        <span>Opérateur: <span className="font-semibold">{request.provider || 'N/A'}</span></span>
                        <span>Numéro: <span className="font-semibold">{request.withdrawalPhoneNumber || 'N/A'}</span></span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(request.requestDate).toLocaleString('fr-FR')}</p>
                </div>
                {request.status === 'pending' && (
                    <div className="flex gap-2">
                        <Button size="sm" onClick={() => onApprove(request)} className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-2 h-4 w-4" />Approuver</Button>
                        <Button size="sm" variant="outline" onClick={() => onReject(request)} className="border-red-500 text-red-500 hover:bg-red-500/10"><XCircle className="mr-2 h-4 w-4" />Rejeter</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

export function AdminFinance() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [allWithdrawals, setAllWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState({ stats: true, withdrawals: true });
  const [error, setError] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Withdrawal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchAllData = async () => {
    setIsLoading({ stats: true, withdrawals: true });
    setError(null);
    try {
      const [statsData, withdrawalsData] = await Promise.all([
        getGlobalFinancialStats(),
        getWithdrawals(),
      ]);
      setStats(statsData);
      
      // Correction défensive : s'assurer que chaque objet a un `id`.
      const sanitizedWithdrawals = withdrawalsData.map(w => ({
        ...w,
        id: w.id || w._id,
      }));

      setAllWithdrawals(sanitizedWithdrawals as Withdrawal[]);
    } catch (err) { 
      setError("Impossible de charger les données. Une erreur est survenue."); 
      console.error("Erreur détaillée:", err);
    } 
    finally { 
      setIsLoading({ stats: false, withdrawals: false }); 
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleApprove = (request: Withdrawal) => { 
    setSelectedRequest(request); 
    setShowApproveDialog(true); 
  };
  
  const handleReject = (request: Withdrawal) => { 
    setSelectedRequest(request); 
    setRejectionReason("");
    setShowRejectDialog(true); 
  };

  const confirmProcessRequest = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) {
      toast.error("Aucune demande sélectionnée.");
      return;
    }

    if (action === 'reject' && !rejectionReason.trim()) {
      toast.error("Un motif est obligatoire pour rejeter une demande.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await processWithdrawalRequest(selectedRequest.id, action, rejectionReason);
      
      toast.success(`Demande ${action === 'approve' ? 'approuvée' : 'rejetée'}.`);
      await fetchAllData();
    } catch (err: any) { 
      toast.error(err?.response?.data?.detail || "Erreur lors de la mise à jour."); 
      console.error("Erreur API lors du traitement:", err);
    } 
    finally {
      setIsSubmitting(false);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
    }
  };
  
  const pendingRequests = allWithdrawals.filter(w => w.status === 'pending');
  const approvedRequests = allWithdrawals.filter(w => w.status === 'approved');
  const rejectedRequests = allWithdrawals.filter(w => w.status === 'rejected');

  const renderTabContent = (requests: Withdrawal[], type: 'pending' | 'approved' | 'rejected') => {
      const emptyMessages = { pending: { icon: Wallet, text: "Aucune demande de retrait en attente" }, approved: { icon: CheckCircle, text: "Aucune demande approuvée" }, rejected: { icon: XCircle, text: "Aucune demande rejetée" }};
      const EmptyIcon = emptyMessages[type].icon;
      if (requests.length === 0) { return <Card className="p-8 text-center"><EmptyIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">{emptyMessages[type].text}</p></Card>; }
      return requests.map((req) => <WithdrawalCard key={req.id} request={req} onApprove={handleApprove} onReject={handleReject} />);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8"><h1 className="text-2xl md:text-3xl font-bold">Gestion Financière</h1><p className="text-sm md:text-base text-muted-foreground">Suivez les statistiques et approuvez les demandes de retrait</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
        {isLoading.stats ? <Card className="p-6 flex items-center justify-center col-span-full"><Loader2 className="h-6 w-6 animate-spin"/></Card> : error ? <Card className="p-6 text-center text-red-500 col-span-full">{error}</Card> : (
            <>
                <StatCard title="Crédits totaux" value={stats?.totalCredits ?? 0} icon={TrendingUp} iconBg="bg-[#FF6B00]/10" iconColor="text-[#FF6B00]" />
                <StatCard title="Retraits totaux" value={stats?.totalWithdrawals ?? 0} icon={Trophy} iconBg="bg-[#FFD700]/10" iconColor="text-[#FFD700]" />
                <StatCard title="Bénéfice (Solde)" value={stats?.balance ?? 0} icon={DollarSign} iconBg="bg-green-500/10" iconColor="text-green-500" profitColor />
                <StatCard title="Retraits en attente" value={stats?.pendingWithdrawalsCount ?? 0} icon={Users} iconBg="bg-blue-500/10" iconColor="text-blue-500" isCurrency={false} />
            </>
        )}
      </div>
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="pending">En attente ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approuvées ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejetées ({rejectedRequests.length})</TabsTrigger>
        </TabsList>
        {isLoading.withdrawals ? <Card className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></Card> : (
        <>
            <TabsContent value="pending" className="space-y-4">{renderTabContent(pendingRequests, 'pending')}</TabsContent>
            <TabsContent value="approved" className="space-y-4">{renderTabContent(approvedRequests, 'approved')}</TabsContent>
            <TabsContent value="rejected" className="space-y-4">{renderTabContent(rejectedRequests, 'rejected')}</TabsContent>
        </>
        )}
      </Tabs>
      
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approuver le retrait ?</AlertDialogTitle>
            <AlertDialogDescription>Confirmez l'approbation de <strong>{selectedRequest?.amount.toLocaleString('fr-FR')} F</strong> pour <strong>{selectedRequest?.playerInfo?.username}</strong>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmProcessRequest('approve')} disabled={isSubmitting} className="bg-green-500 hover:bg-green-600">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Approuver</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rejeter le retrait ?</AlertDialogTitle>
            <AlertDialogDescription>
              Confirmez le rejet de la demande de <strong>{selectedRequest?.amount.toLocaleString('fr-FR')} F</strong> pour <strong>{selectedRequest?.playerInfo?.username}</strong>. Un motif est obligatoire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <label htmlFor="rejectionReason" className="text-sm font-medium text-muted-foreground">Motif du rejet</label>
            <Input
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Le numéro fourni est incorrect."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmProcessRequest('reject')} 
              disabled={isSubmitting || !rejectionReason.trim()} 
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
              Confirmer le Rejet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
