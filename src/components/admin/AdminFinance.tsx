// src/components/admin/AdminFinance.tsx

import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Wallet, Trophy, DollarSign, TrendingUp, Loader2 } from "lucide-react";
// CORRECTION : On importe depuis notre fichier withdrawalsAPI.ts
import { getFinancialStatsAPI, getAllWithdrawalRequestsAPI, processWithdrawalRequestAPI, WithdrawalRequest, FinancialStats } from "../../utils/withdrawalsAPI";

export function AdminFinance() {
  const [stats, setStats] = useState<FinancialStats | null>(null);
  const [pendingRequests, setPendingRequests] = useState<WithdrawalRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<WithdrawalRequest[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<WithdrawalRequest[]>([]);
  
  const [isLoading, setIsLoading] = useState({ stats: true, withdrawals: true });
  const [error, setError] = useState<string | null>(null);
  
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllData = async () => {
    setIsLoading({ stats: true, withdrawals: true });
    setError(null);
    try {
      const [statsData, pendingData, approvedData, rejectedData] = await Promise.all([
        getFinancialStatsAPI(),
        getAllWithdrawalRequestsAPI('pending'),
        getAllWithdrawalRequestsAPI('approved'),
        getAllWithdrawalRequestsAPI('rejected'),
      ]);
      setStats(statsData);
      setPendingRequests(pendingData);
      setApprovedRequests(approvedData);
      setRejectedRequests(rejectedData);
    } catch (err) {
      setError("Impossible de charger les données financières. Vérifiez vos permissions.");
      console.error(err);
    } finally {
      setIsLoading({ stats: false, withdrawals: false });
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleApprove = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setShowApproveDialog(true);
  };

  const handleReject = (request: WithdrawalRequest) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  const confirmProcessRequest = async (action: 'approve' | 'reject') => {
    if (!selectedRequest) return;
    
    setIsSubmitting(true);
    try {
      await processWithdrawalRequestAPI(selectedRequest.id, action);
      toast.success(`Demande de retrait ${action === 'approve' ? 'approuvée' : 'rejetée'}.`);
      await fetchAllData();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Erreur lors du traitement de la demande.");
    } finally {
      setIsSubmitting(false);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
      setSelectedRequest(null);
    }
  };
  
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion Financière</h1>
        <p className="text-sm md:text-base text-muted-foreground">Suivez les statistiques et approuvez les demandes de retrait</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
        {isLoading.stats ? (
            <Card className="p-6 flex items-center justify-center col-span-full"><Loader2 className="h-6 w-6 animate-spin"/></Card>
        ) : error ? (
            <Card className="p-6 text-center text-red-500 col-span-full">{error}</Card>
        ) : (
            <>
                <Card className="p-4 md:p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Total Mises</p><p className="text-2xl font-bold">{(stats?.totalStakes ?? 0).toLocaleString('fr-FR')} F</p></div><div className="rounded-full bg-[#FF6B00]/10 p-3"><TrendingUp className="h-6 w-6 text-[#FF6B00]" /></div></div></Card>
                <Card className="p-4 md:p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Gains Distribués</p><p className="text-2xl font-bold">{(stats?.totalWinnings ?? 0).toLocaleString('fr-FR')} F</p></div><div className="rounded-full bg-[#FFD700]/10 p-3"><Trophy className="h-6 w-6 text-[#FFD700]" /></div></div></Card>
                <Card className="p-4 md:p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Bénéfice Net</p><p className={`text-2xl font-bold ${(stats?.netProfit ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>{(stats?.netProfit ?? 0).toLocaleString('fr-FR')} F</p></div><div className="rounded-full bg-green-500/10 p-3"><DollarSign className="h-6 w-6 text-green-500" /></div></div></Card>
                <Card className="p-4 md:p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground mb-1">Joueurs Actifs</p><p className="text-2xl font-bold">{(stats?.activePlayers ?? 0)}</p></div></div></Card>
            </>
        )}
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="pending">En attente ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approuvées ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejetées ({rejectedRequests.length})</TabsTrigger>
        </TabsList>
        
        {isLoading.withdrawals ? (
             <Card className="p-8 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin"/></Card>
        ) : error && ( // Affiche l'erreur uniquement si les retraits n'ont pas pu charger
            <Card className="p-8 text-center text-red-500">{error}</Card>
        ) : (
        <>
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length === 0 ? <Card className="p-8 text-center"><Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">Aucune demande de retrait en attente</p></Card> : pendingRequests.map((req) => (
            <Card key={req.id} className="p-6 border-l-4 border-l-[#FF6B00]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1"><h3 className="font-bold text-lg">{req.username}</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 text-sm mt-2"><span>Montant: <span className="font-semibold">{req.amount.toLocaleString('fr-FR')} F</span></span><span>Opérateur: <span className="font-semibold">{req.provider}</span></span><span>Numéro: <span className="font-semibold">{req.withdrawalPhoneNumber}</span></span></div><p className="text-xs text-muted-foreground mt-2">{new Date(req.requestDate).toLocaleString('fr-FR')}</p></div>
                <div className="flex gap-2"><Button size="sm" onClick={() => handleApprove(req)} className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-2 h-4 w-4" />Approuver</Button><Button size="sm" variant="outline" onClick={() => handleReject(req)} className="border-red-500 text-red-500 hover:bg-red-500/10"><XCircle className="mr-2 h-4 w-4" />Rejeter</Button></div>
              </div>
            </Card>
          ))}
        </TabsContent>
        <TabsContent value="approved" className="space-y-4">{approvedRequests.length === 0 ? <Card className="p-8 text-center"><CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">Aucune demande approuvée</p></Card> : approvedRequests.map((req) => (<Card key={req.id} className="p-6 border-l-4 border-l-green-500">{/* ... JSX pour les demandes approuvées ... */}</Card>))}</TabsContent>
        <TabsContent value="rejected" className="space-y-4">{rejectedRequests.length === 0 ? <Card className="p-8 text-center"><XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">Aucune demande rejetée</p></Card> : rejectedRequests.map((req) => (<Card key={req.id} className="p-6 border-l-4 border-l-red-500">{/* ... JSX pour les demandes rejetées ... */}</Card>))}</TabsContent>
        </>
        )}
      </Tabs>
      
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Approuver le retrait ?</AlertDialogTitle><AlertDialogDescription>Confirmez l'approbation du retrait de <strong>{selectedRequest?.amount.toLocaleString('fr-FR')} F</strong> pour <strong>{selectedRequest?.username}</strong> vers le numéro <strong>{selectedRequest?.withdrawalPhoneNumber}</strong>.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => confirmProcessRequest('approve')} disabled={isSubmitting} className="bg-green-500 hover:bg-green-600">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Approuver</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Rejeter le retrait ?</AlertDialogTitle><AlertDialogDescription>Confirmez le rejet du retrait de <strong>{selectedRequest?.amount.toLocaleString('fr-FR')} F</strong> pour <strong>{selectedRequest?.username}</strong>.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel disabled={isSubmitting}>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => confirmProcessRequest('reject')} disabled={isSubmitting} className="bg-red-500 hover:bg-red-500">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Rejeter</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}