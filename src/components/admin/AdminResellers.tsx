// src/components/admin/AdminResellers.tsx

import { useState, useEffect } from "react";
import { getResellersPage, createResellerAPI, updateUserStatusAPI, creditResellerBalanceAPI, Reseller } from "../../utils/resellerAPI";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { Eye, Ban, CheckCircle, Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface ResellerDetailsModal { isOpen: boolean; reseller: Reseller | null; }
interface CreateResellerModal { isOpen: boolean; }

const COUNTRIES = [ { code: '+228', name: 'Togo', flag: '🇹🇬' }, { code: '+229', name: 'Bénin', flag: '🇧🇯' }, { code: '+225', name: "Côte d'Ivoire", flag: '🇨🇮' }, { code: '+233', name: 'Ghana', flag: '🇬🇭' }, { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' } ];

export function AdminResellers() {
  // --- ÉTATS CONNECTÉS À L'API (SIMPLIFIÉS) ---
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const RESELLERS_PER_PAGE = 5;

  // --- ÉTATS DE L'UI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsModal, setDetailsModal] = useState<ResellerDetailsModal>({ isOpen: false, reseller: null });
  const [createModal, setCreateModal] = useState<CreateResellerModal>({ isOpen: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [adjustAmount, setAdjustAmount] = useState("");
  
  const [newResellerUsername, setNewResellerUsername] = useState("");
  const [newResellerCountryCode, setNewResellerCountryCode] = useState("+228");
  const [newResellerPhone, setNewResellerPhone] = useState("");
  const [newResellerEmail, setNewResellerEmail] = useState("");
  const [newResellerPassword, setNewResellerPassword] = useState("");
  const [newResellerTokenBalance, setNewResellerTokenBalance] = useState("");

  // --- LOGIQUE DE RÉCUPÉRATION DES DONNÉES (CORRIGÉE) ---
  useEffect(() => {
    const fetchResellers = async (page: number) => {
      setIsLoading(true); setError(null);
      try {
        const data = await getResellersPage(page, RESELLERS_PER_PAGE);
        setResellers(data);
        setIsLastPage(data.length < RESELLERS_PER_PAGE);
      } catch (err) { setError("Impossible de charger les revendeurs."); } 
      finally { setIsLoading(false); }
    };
    fetchResellers(currentPage);
  }, [currentPage, refreshKey]);
  
  const handleNextPage = () => !isLastPage && setCurrentPage(p => p + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);

  const handleCreateReseller = async () => {
    if (!newResellerUsername || !newResellerPhone || !newResellerEmail || !newResellerPassword) { return toast.error("Veuillez remplir tous les champs obligatoires."); }
    if (!newResellerEmail.includes('@')) { return toast.error("Format d'email invalide."); }
    if (newResellerPassword.length < 8) { return toast.error("Le mot de passe doit contenir au moins 8 caractères."); }

    const fullPhoneNumber = `${newResellerCountryCode}${newResellerPhone.replace(/\s/g, '')}`;
    const initialTokenBalance = newResellerTokenBalance ? parseFloat(newResellerTokenBalance) : 0;
    
    setIsSubmitting(true);
    try {
      await createResellerAPI({ username: newResellerUsername, phoneNumber: fullPhoneNumber, email: newResellerEmail, password: newResellerPassword, initialTokenBalance });
      toast.success("Revendeur créé avec succès !");
      setCreateModal({ isOpen: false });
      setRefreshKey(prev => prev + 1);
      setNewResellerUsername(""); setNewResellerPhone(""); setNewResellerEmail(""); setNewResellerPassword(""); setNewResellerTokenBalance("");
    } catch (err: any) { toast.error(err?.response?.data?.detail || "Erreur lors de la création."); } 
    finally { setIsSubmitting(false); }
  };

  const handleToggleStatus = async (reseller: Reseller) => {
    const newStatus = reseller.status === 'active' ? 'suspended' : 'active';
    setIsSubmitting(true);
    try {
      await updateUserStatusAPI(reseller.id, newStatus);
      toast.success(`Statut mis à jour à : ${newStatus}`);
      setDetailsModal({ isOpen: false, reseller: null });
      setRefreshKey(prev => prev + 1);
    } catch(err) { toast.error("Échec de la mise à jour du statut."); } 
    finally { setIsSubmitting(false); }
  };
  
  const handleAdjustTokens = async (reseller: Reseller) => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) { return toast.error("Veuillez entrer un montant positif à créditer."); }
    
    setIsSubmitting(true);
    try {
      await creditResellerBalanceAPI(reseller.id, amount);
      toast.success(`${amount.toLocaleString('fr-FR')} F crédités avec succès !`);
      setAdjustAmount("");
      setDetailsModal({ isOpen: false, reseller: null });
      setRefreshKey(prev => prev + 1);
    } catch (err) { toast.error("Échec de l'ajustement du solde."); } 
    finally { setIsSubmitting(false); }
  };
  
  const filteredResellers = (resellers || []).filter(r =>
    r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phoneNumber.includes(searchTerm) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8" key={refreshKey}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion des Revendeurs</h1><p className="text-sm md:text-base text-muted-foreground">Gérer tous les comptes revendeurs</p></div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4"><Button onClick={() => setCreateModal({ isOpen: true })} className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"><Plus className="h-4 w-4 mr-2" />Créer un revendeur</Button><Input placeholder="Rechercher un revendeur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-60 md:w-80" /><Badge variant="outline" className="text-sm md:text-base px-3 md:px-4 py-2 text-center">{filteredResellers.length} revendeur{filteredResellers.length !== 1 ? 's' : ''} sur la page</Badge></div>
      </div>

      <Card className="border-border">
        {isLoading ? (<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" /></div>) 
        : error ? (<div className="text-center text-red-500 p-8">{error}</div>) 
        : (<>
            <div className="hidden md:block overflow-auto"><Table><TableHeader><TableRow className="border-border hover:bg-accent/50"><TableHead>Nom d'utilisateur</TableHead><TableHead>Numéro de téléphone</TableHead><TableHead>Email</TableHead><TableHead>Solde de Jetons</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredResellers.map((reseller) => (<TableRow key={reseller.id} className="border-border hover:bg-accent/30"><TableCell className="font-medium">{reseller.username}</TableCell><TableCell>{reseller.phoneNumber}</TableCell><TableCell>{reseller.email}</TableCell><TableCell className="text-[#FFD700]">{reseller.tokenBalance.toLocaleString('fr-FR')} F</TableCell><TableCell><Badge variant={reseller.status === 'suspended' ? 'destructive' : 'default'} className={reseller.status === 'suspended' ? '' : 'bg-green-600 hover:bg-green-700'}>{reseller.status === 'suspended' ? 'Suspendu' : 'Actif'}</Badge></TableCell><TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setDetailsModal({ isOpen: true, reseller })}><Eye className="h-4 w-4 mr-2" />Détails</Button></TableCell></TableRow>))}</TableBody></Table></div>
            <div className="md:hidden space-y-3 p-4">{filteredResellers.map((reseller) => (<Card key={reseller.id} className="p-4 border-border"><div className="space-y-3"><div className="flex items-start justify-between"><div><p className="font-bold text-foreground">{reseller.username}</p><p className="text-sm text-muted-foreground">{reseller.phoneNumber}</p></div><Badge variant={reseller.status === 'suspended' ? 'destructive' : 'default'} className={reseller.status === 'suspended' ? 'text-xs' : 'bg-green-600 text-xs'}>{reseller.status === 'suspended' ? 'Suspendu' : 'Actif'}</Badge></div><div className="grid grid-cols-2 gap-2 text-sm"><div><p className="text-muted-foreground text-xs">Solde Jetons</p><p className="font-medium text-[#FFD700]">{reseller.tokenBalance.toLocaleString('fr-FR')} F</p></div></div><Button variant="outline" size="sm" className="w-full" onClick={() => setDetailsModal({ isOpen: true, reseller })}><Eye className="h-4 w-4 mr-2" />Voir les détails</Button></div></Card>))}</div>
            <div className="flex items-center justify-between p-4 border-t"><span className="text-sm text-muted-foreground">Page {currentPage}</span><div className="flex gap-2"><Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-2" />Précédent</Button><Button variant="outline" size="sm" onClick={handleNextPage} disabled={isLastPage}>Suivant<ChevronRight className="h-4 w-4 ml-2" /></Button></div></div>
           </>
        )}
      </Card>
      
      <Dialog open={createModal.isOpen} onOpenChange={(open) => setCreateModal({ isOpen: open })}><DialogContent className="max-w-md bg-card border-border"><DialogHeader><DialogTitle>Créer un nouveau revendeur</DialogTitle><DialogDescription className="sr-only">Formulaire de création d'un nouveau compte revendeur</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label htmlFor="username">Nom d'utilisateur *</Label><Input id="username" placeholder="Ex: SUPER_LOTO" value={newResellerUsername} onChange={(e) => setNewResellerUsername(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="phone">Numéro de téléphone *</Label><div className="flex gap-2"><Select value={newResellerCountryCode} onValueChange={setNewResellerCountryCode}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent>{COUNTRIES.map((country) => (<SelectItem key={country.code} value={country.code}><span className="flex items-center gap-2"><span>{country.flag}</span><span>{country.code}</span></span></SelectItem>))}</SelectContent></Select><Input id="phone" placeholder="90 12 34 56" value={newResellerPhone} onChange={(e) => setNewResellerPhone(e.target.value)} className="flex-1" /></div></div><div className="space-y-2"><Label htmlFor="email">Email *</Label><Input id="email" type="email" placeholder="revendeur@example.com" value={newResellerEmail} onChange={(e) => setNewResellerEmail(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="password">Mot de passe *</Label><Input id="password" type="password" placeholder="Minimum 8 caractères" value={newResellerPassword} onChange={(e) => setNewResellerPassword(e.target.value)} /></div><div className="space-y-2"><Label htmlFor="tokenBalance">Solde de jetons initial (optionnel)</Label><Input id="tokenBalance" type="number" placeholder="0" value={newResellerTokenBalance} onChange={(e) => setNewResellerTokenBalance(e.target.value)} /></div></div><DialogFooter className="flex gap-2"><Button variant="outline" onClick={() => setCreateModal({ isOpen: false })}>Annuler</Button><Button onClick={handleCreateReseller} disabled={isSubmitting} className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90">{isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Créer le revendeur</Button></DialogFooter></DialogContent></Dialog>
      
      <Dialog open={detailsModal.isOpen} onOpenChange={(open) => setDetailsModal({ isOpen: false, reseller: null })}><DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border"><DialogHeader><DialogTitle>Détails du revendeur : {detailsModal.reseller?.username}</DialogTitle><DialogDescription className="sr-only">Informations détaillées et actions administrateur pour ce revendeur</DialogDescription></DialogHeader>{detailsModal.reseller && (<div className="space-y-6 overflow-y-auto scrollbar-visible flex-1"><div className="grid grid-cols-2 gap-4"><div><Label className="text-muted-foreground">Numéro de téléphone</Label><p className="font-medium">{detailsModal.reseller.phoneNumber}</p></div><div><Label className="text-muted-foreground">Email</Label><p className="font-medium">{detailsModal.reseller.email}</p></div><div><Label className="text-muted-foreground">Solde de Jetons</Label><p className="font-medium text-[#FFD700]">{detailsModal.reseller.tokenBalance.toLocaleString('fr-FR')} F CFA</p></div><div><Label className="text-muted-foreground">Statut</Label><Badge variant={detailsModal.reseller.status === 'suspended' ? 'destructive' : 'default'} className={detailsModal.reseller.status === 'suspended' ? '' : 'bg-green-600'}>{detailsModal.reseller.status === 'suspended' ? 'Suspendu' : 'Actif'}</Badge></div></div><div className="border-t border-border pt-4 space-y-4"><Label>Actions administrateur</Label><div className="grid grid-cols-2 gap-4"><div><Input type="number" placeholder="Montant à créditer" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} /></div></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => handleAdjustTokens(detailsModal.reseller!)} disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}Créditer des Jetons</Button></div></div></div>)}<DialogFooter className="flex gap-2"><Button variant={detailsModal.reseller?.status === 'suspended' ? 'default' : 'destructive'} onClick={() => handleToggleStatus(detailsModal.reseller!)} disabled={isSubmitting}>{isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin"/>}{detailsModal.reseller?.status === 'suspended' ? (<><CheckCircle className="h-4 w-4 mr-2"/> Réactiver</>) : (<><Ban className="h-4 w-4 mr-2"/> Suspendre</>)}</Button><Button variant="outline" onClick={() => setDetailsModal({ isOpen: false, reseller: null })}>Fermer</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}