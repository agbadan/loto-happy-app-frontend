// src/components/admin/AdminPlayers.tsx

import { useState, useEffect } from "react";
import { getPlayersPage, Player } from "../../utils/playerAPI"; 
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { Eye, Ban, CheckCircle, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface PlayerDetailsModal {
  isOpen: boolean;
  player: Player | null;
}

export function AdminPlayers() {
  // --- ÉTATS CONNECTÉS À L'API (SIMPLIFIÉS) ---
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const PLAYERS_PER_PAGE = 10;
  
  // --- ÉTATS DE L'UI ---
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsModal, setDetailsModal] = useState<PlayerDetailsModal>({ isOpen: false, player: null });
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // --- LOGIQUE DE RÉCUPÉRATION DES DONNÉES (CORRIGÉE) ---
  useEffect(() => {
    const fetchPlayers = async (page: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getPlayersPage(page, PLAYERS_PER_PAGE);
        setPlayers(data);
        setIsLastPage(data.length < PLAYERS_PER_PAGE);
      } catch (err) {
        setError("Impossible de charger les joueurs. Vérifiez vos permissions.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlayers(currentPage);
  }, [currentPage, refreshKey]);

  const handleNextPage = () => !isLastPage && setCurrentPage(p => p + 1);
  const handlePrevPage = () => currentPage > 1 && setCurrentPage(p => p - 1);
  
  // TODO: Connecter ces fonctions aux nouvelles routes API
  const handleToggleStatus = (player: Player) => {
    toast.warning("Fonctionnalité 'Suspendre/Réactiver' non connectée à l'API.");
    setRefreshKey(p => p + 1);
    setDetailsModal({ isOpen: false, player: null });
  };
  const handleAdjustBalance = (player: Player, balanceType: 'game' | 'winnings') => {
    toast.warning("Fonctionnalité 'Ajuster Solde' non connectée à l'API.");
    setRefreshKey(p => p + 1);
    setDetailsModal({ isOpen: false, player: null });
  };

  const filteredPlayers = (players || []).filter(p =>
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phoneNumber.includes(searchTerm) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion des Joueurs</h1><p className="text-sm md:text-base text-muted-foreground">Gérer tous les comptes joueurs</p></div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4"><Input placeholder="Rechercher un joueur..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full sm:w-60 md:w-80" /><Badge variant="outline" className="text-sm md:text-base px-3 md:px-4 py-2 text-center">{filteredPlayers.length} joueur{filteredPlayers.length !== 1 ? 's' : ''} sur la page</Badge></div>
      </div>

      {/* Tableau et listes */}
      <Card className="border-border">
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-[#FFD700]" /></div>
        ) : error ? (
          <div className="text-center text-red-500 p-8">{error}</div>
        ) : (
          <>
            {/* Table - Desktop */}
            <div className="hidden md:block overflow-auto">
              <Table>
                <TableHeader><TableRow className="border-border hover:bg-accent/50"><TableHead>Nom d'utilisateur</TableHead><TableHead>Numéro de téléphone</TableHead><TableHead>Email</TableHead><TableHead>Solde Jeu</TableHead><TableHead>Solde Gains</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredPlayers.map((player) => (
                    <TableRow key={player._id} className="border-border hover:bg-accent/30">
                      <TableCell className="font-medium">{player.username}</TableCell><TableCell>{player.phoneNumber}</TableCell><TableCell>{player.email}</TableCell><TableCell>{player.balanceGame.toLocaleString('fr-FR')} F</TableCell><TableCell>{player.balanceWinnings.toLocaleString('fr-FR')} F</TableCell>
                      <TableCell><Badge variant={player.status === 'suspended' ? 'destructive' : 'default'} className={player.status === 'suspended' ? '' : 'bg-green-600 hover:bg-green-700'}>{player.status === 'suspended' ? 'Suspendu' : 'Actif'}</Badge></TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setDetailsModal({ isOpen: true, player })}><Eye className="h-4 w-4 mr-2" />Détails</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Cards - Mobile */}
            <div className="md:hidden space-y-3 p-4">
              {filteredPlayers.map((player) => (
                <Card key={player._id} className="p-4 border-border"><div className="space-y-3"><div className="flex items-start justify-between"><div><p className="font-bold text-foreground">{player.username}</p><p className="text-sm text-muted-foreground">{player.phoneNumber}</p><p className="text-xs text-muted-foreground truncate">{player.email}</p></div><Badge variant={player.status === 'suspended' ? 'destructive' : 'default'} className={player.status === 'suspended' ? 'text-xs' : 'bg-green-600 text-xs'}>{player.status === 'suspended' ? 'Suspendu' : 'Actif'}</Badge></div><div className="grid grid-cols-2 gap-2 text-sm"><div><p className="text-muted-foreground text-xs">Solde Jeu</p><p className="font-medium text-[#FFD700]">{player.balanceGame.toLocaleString('fr-FR')} F</p></div><div><p className="text-muted-foreground text-xs">Solde Gains</p><p className="font-medium text-[#FF6B00]">{player.balanceWinnings.toLocaleString('fr-FR')} F</p></div></div><Button variant="outline" size="sm" className="w-full" onClick={() => setDetailsModal({ isOpen: true, player })}><Eye className="h-4 w-4 mr-2" />Voir les détails</Button></div></Card>
              ))}
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t">
              <span className="text-sm text-muted-foreground">Page {currentPage}</span>
              <div className="flex gap-2"><Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-2" />Précédent</Button><Button variant="outline" size="sm" onClick={handleNextPage} disabled={isLastPage}>Suivant<ChevronRight className="h-4 w-4 ml-2" /></Button></div>
            </div>
          </>
        )}
      </Card>

      {/* Modal Détails */}
      <Dialog open={detailsModal.isOpen} onOpenChange={(open) => setDetailsModal({ isOpen: false, player: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-visible bg-card border-border">
          <DialogHeader><DialogTitle className="text-base md:text-lg">Détails du joueur : {detailsModal.player?.username}</DialogTitle><DialogDescription className="sr-only">Informations détaillées et actions administrateur pour ce joueur</DialogDescription></DialogHeader>
          {detailsModal.player && (
            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div><Label className="text-muted-foreground text-xs md:text-sm">Numéro de téléphone</Label><p className="font-medium text-sm md:text-base">{detailsModal.player.phoneNumber}</p></div>
                <div><Label className="text-muted-foreground text-xs md:text-sm">Email</Label><p className="font-medium text-sm md:text-base break-all">{detailsModal.player.email}</p></div>
                <div><Label className="text-muted-foreground text-xs md:text-sm">Solde de Jeu</Label><p className="font-medium text-[#FFD700] text-sm md:text-base">{detailsModal.player.balanceGame.toLocaleString('fr-FR')} F CFA</p></div>
                <div><Label className="text-muted-foreground text-xs md:text-sm">Solde des Gains</Label><p className="font-medium text-[#FF6B00] text-sm md:text-base">{detailsModal.player.balanceWinnings.toLocaleString('fr-FR')} F CFA</p></div>
                <div><Label className="text-muted-foreground text-xs md:text-sm">Créé le</Label><p className="font-medium text-sm">{new Date(detailsModal.player.createdAt).toLocaleString('fr-FR')}</p></div>
                <div><Label className="text-muted-foreground text-xs md:text-sm">Statut</Label><Badge variant={detailsModal.player.status === 'suspended' ? 'destructive' : 'default'} className={detailsModal.player.status === 'suspended' ? 'text-xs' : 'bg-green-600 text-xs'}>{detailsModal.player.status === 'suspended' ? 'Suspendu' : 'Actif'}</Badge></div>
              </div>
              <div className="border-t border-border pt-4 space-y-3 md:space-y-4">
                <Label className="text-xs md:text-sm">Actions administrateur</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"><div><Input type="number" placeholder="Montant (ex: 5000 ou -5000)" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} className="text-sm" /></div><div><Input placeholder="Raison de l'ajustement" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="text-sm" /></div></div>
                <div className="flex flex-col sm:flex-row gap-2"><Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm" onClick={() => handleAdjustBalance(detailsModal.player!, 'game')}>Ajuster Solde Jeu</Button><Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm" onClick={() => handleAdjustBalance(detailsModal.player!, 'winnings')}>Ajuster Solde Gains</Button></div>
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant={detailsModal.player?.status === 'suspended' ? 'default' : 'destructive'} size="sm" className="w-full sm:w-auto text-xs md:text-sm" onClick={() => handleToggleStatus(detailsModal.player!)}>{detailsModal.player?.status === 'suspended' ? <><CheckCircle className="h-4 w-4 mr-2" /> Réactiver</> : <><Ban className="h-4 w-4 mr-2" /> Suspendre</>}</Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs md:text-sm" onClick={() => setDetailsModal({ isOpen: false, player: null })}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}