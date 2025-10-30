import { useState } from "react";
import { getAllPlayers, toggleUserStatus, adminAdjustBalance } from "../../utils/auth";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Label } from "../ui/label";
import { toast } from "sonner@2.0.3";
import { Eye, Ban, CheckCircle, RefreshCw } from "lucide-react";

interface PlayerDetailsModal {
  isOpen: boolean;
  player: any;
}

export function AdminPlayers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsModal, setDetailsModal] = useState<PlayerDetailsModal>({
    isOpen: false,
    player: null,
  });
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const players = getAllPlayers();

  // Filtrer les joueurs selon le terme de recherche
  const filteredPlayers = players.filter(p =>
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phoneNumber.includes(searchTerm) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (player: any) => {
    setDetailsModal({ isOpen: true, player });
  };

  const handleToggleStatus = (phoneNumber: string) => {
    const success = toggleUserStatus(phoneNumber);
    if (success) {
      toast.success("Statut du compte modifié avec succès");
      setRefreshKey(prev => prev + 1);
      setDetailsModal({ ...detailsModal, isOpen: false });
    } else {
      toast.error("Erreur lors de la modification du statut");
    }
  };

  const handleAdjustBalance = (phoneNumber: string, balanceType: 'game' | 'winnings') => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || !adjustReason) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const success = adminAdjustBalance(phoneNumber, amount, balanceType, adjustReason);
    if (success) {
      toast.success(`Solde ${balanceType === 'game' ? 'de jeu' : 'des gains'} ajusté avec succès`);
      setAdjustAmount("");
      setAdjustReason("");
      setRefreshKey(prev => prev + 1);
      setDetailsModal({ ...detailsModal, isOpen: false });
    } else {
      toast.error("Erreur lors de l'ajustement du solde");
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion des Joueurs</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gérer tous les comptes joueurs</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <Input
            placeholder="Rechercher un joueur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 md:w-80"
          />
          <Badge variant="outline" className="text-sm md:text-base px-3 md:px-4 py-2 text-center">
            {filteredPlayers.length} joueur{filteredPlayers.length > 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Table - Desktop */}
      <Card className="border-border hidden md:block overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-accent/50">
              <TableHead>Nom d'utilisateur</TableHead>
              <TableHead>Numéro de téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Solde Jeu</TableHead>
              <TableHead>Solde Gains</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers.map((player) => (
              <TableRow key={player.phoneNumber} className="border-border hover:bg-accent/30">
                <TableCell className="font-medium">{player.username}</TableCell>
                <TableCell>+{player.phoneNumber}</TableCell>
                <TableCell>{player.email}</TableCell>
                <TableCell>{player.balanceGame.toLocaleString('fr-FR')} F</TableCell>
                <TableCell>{player.balanceWinnings.toLocaleString('fr-FR')} F</TableCell>
                <TableCell>
                  <Badge 
                    variant={player.status === 'suspended' ? 'destructive' : 'default'}
                    className={player.status === 'suspended' ? '' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {player.status === 'suspended' ? 'Suspendu' : 'Actif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(player)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Détails
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Table - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredPlayers.map((player) => (
          <Card key={player.phoneNumber} className="p-4 border-border">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-foreground">{player.username}</p>
                  <p className="text-sm text-muted-foreground">+{player.phoneNumber}</p>
                  <p className="text-xs text-muted-foreground truncate">{player.email}</p>
                </div>
                <Badge 
                  variant={player.status === 'suspended' ? 'destructive' : 'default'}
                  className={player.status === 'suspended' ? 'text-xs' : 'bg-green-600 text-xs'}
                >
                  {player.status === 'suspended' ? 'Suspendu' : 'Actif'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Solde Jeu</p>
                  <p className="font-medium text-[#FFD700]">{player.balanceGame.toLocaleString('fr-FR')} F</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Solde Gains</p>
                  <p className="font-medium text-[#FF6B00]">{player.balanceWinnings.toLocaleString('fr-FR')} F</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewDetails(player)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir les détails
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Détails */}
      <Dialog open={detailsModal.isOpen} onOpenChange={(open) => setDetailsModal({ ...detailsModal, isOpen: open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-visible bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Détails du joueur : {detailsModal.player?.username}</DialogTitle>
            <DialogDescription className="sr-only">
              Informations détaillées et actions administrateur pour ce joueur
            </DialogDescription>
          </DialogHeader>

          {detailsModal.player && (
            <div className="space-y-4 md:space-y-6">
              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs md:text-sm">Numéro de téléphone</Label>
                  <p className="font-medium text-sm md:text-base">+{detailsModal.player.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs md:text-sm">Email</Label>
                  <p className="font-medium text-sm md:text-base break-all">{detailsModal.player.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs md:text-sm">Solde de Jeu</Label>
                  <p className="font-medium text-[#FFD700] text-sm md:text-base">
                    {detailsModal.player.balanceGame.toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs md:text-sm">Solde des Gains</Label>
                  <p className="font-medium text-[#FF6B00] text-sm md:text-base">
                    {detailsModal.player.balanceWinnings.toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs md:text-sm">Méthode d'authentification</Label>
                  <p className="font-medium capitalize text-sm md:text-base">{detailsModal.player.authMethod || 'password'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs md:text-sm">Statut</Label>
                  <Badge 
                    variant={detailsModal.player.status === 'suspended' ? 'destructive' : 'default'}
                    className={detailsModal.player.status === 'suspended' ? 'text-xs' : 'bg-green-600 text-xs'}
                  >
                    {detailsModal.player.status === 'suspended' ? 'Suspendu' : 'Actif'}
                  </Badge>
                </div>
              </div>

              {/* Historique des transactions (dernières 5) */}
              <div>
                <Label className="text-muted-foreground mb-2 block text-xs md:text-sm">Historique récent</Label>
                <div className="border border-border rounded-lg p-3 md:p-4 max-h-40 overflow-y-auto scrollbar-visible">
                  {detailsModal.player.playerTransactionHistory?.slice(0, 5).map((tx: any, i: number) => (
                    <div key={i} className="text-xs md:text-sm py-2 border-b border-border last:border-0">
                      <div className="flex justify-between gap-2">
                        <span className="truncate">{tx.description}</span>
                        <span className={`flex-shrink-0 ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString('fr-FR')} F
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(tx.date).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground text-xs md:text-sm">Aucune transaction</p>}
                </div>
              </div>

              {/* Actions admin */}
              <div className="border-t border-border pt-4 space-y-3 md:space-y-4">
                <Label className="text-xs md:text-sm">Actions administrateur</Label>
                
                {/* Ajuster le solde */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Montant (ex: 5000 ou -5000)"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Raison de l'ajustement"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-xs md:text-sm"
                    onClick={() => handleAdjustBalance(detailsModal.player.phoneNumber, 'game')}
                  >
                    Ajuster Solde Jeu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-xs md:text-sm"
                    onClick={() => handleAdjustBalance(detailsModal.player.phoneNumber, 'winnings')}
                  >
                    Ajuster Solde Gains
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={detailsModal.player?.status === 'suspended' ? 'default' : 'destructive'}
              size="sm"
              className="w-full sm:w-auto text-xs md:text-sm"
              onClick={() => handleToggleStatus(detailsModal.player.phoneNumber)}
            >
              {detailsModal.player?.status === 'suspended' ? (
                <><CheckCircle className="h-4 w-4 mr-2" /> Réactiver</>
              ) : (
                <><Ban className="h-4 w-4 mr-2" /> Suspendre</>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="w-full sm:w-auto text-xs md:text-sm"
              onClick={() => setDetailsModal({ ...detailsModal, isOpen: false })}
            >
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}