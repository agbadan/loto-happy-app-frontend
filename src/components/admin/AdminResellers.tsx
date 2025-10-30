import { useState } from "react";
import { getAllResellers, toggleUserStatus, adminAdjustBalance, createReseller } from "../../utils/auth";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner@2.0.3";
import { Eye, Ban, CheckCircle, Plus } from "lucide-react";

interface ResellerDetailsModal {
  isOpen: boolean;
  reseller: any;
}

interface CreateResellerModal {
  isOpen: boolean;
}

// Liste des pays avec indicatifs
const COUNTRIES = [
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+229', name: 'Bénin', flag: '🇧🇯' },
  { code: '+225', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
];

export function AdminResellers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [detailsModal, setDetailsModal] = useState<ResellerDetailsModal>({
    isOpen: false,
    reseller: null,
  });
  const [createModal, setCreateModal] = useState<CreateResellerModal>({
    isOpen: false,
  });
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // États pour la création de revendeur
  const [newResellerUsername, setNewResellerUsername] = useState("");
  const [newResellerCountryCode, setNewResellerCountryCode] = useState("+228");
  const [newResellerPhone, setNewResellerPhone] = useState("");
  const [newResellerEmail, setNewResellerEmail] = useState("");
  const [newResellerPassword, setNewResellerPassword] = useState("");
  const [newResellerTokenBalance, setNewResellerTokenBalance] = useState("");

  const resellers = getAllResellers();

  // Filtrer les revendeurs selon le terme de recherche
  const filteredResellers = resellers.filter(r =>
    r.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.phoneNumber.includes(searchTerm) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (reseller: any) => {
    setDetailsModal({ isOpen: true, reseller });
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

  const handleAdjustTokens = (phoneNumber: string) => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || !adjustReason) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    const success = adminAdjustBalance(phoneNumber, amount, 'token', adjustReason);
    if (success) {
      toast.success("Solde de jetons ajusté avec succès");
      setAdjustAmount("");
      setAdjustReason("");
      setRefreshKey(prev => prev + 1);
      setDetailsModal({ ...detailsModal, isOpen: false });
    } else {
      toast.error("Erreur lors de l'ajustement des jetons");
    }
  };

  const handleCreateReseller = () => {
    // Validation
    if (!newResellerUsername || !newResellerPhone || !newResellerEmail || !newResellerPassword) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Valider le format de l'email
    if (!newResellerEmail.includes('@')) {
      toast.error("Format d'email invalide");
      return;
    }

    // Valider le mot de passe (min 6 caractères)
    if (newResellerPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    // Construire le numéro complet
    const fullPhoneNumber = newResellerCountryCode.replace('+', '') + newResellerPhone.replace(/\s/g, '');

    // Valider le solde de tokens (optionnel)
    const tokenBalance = newResellerTokenBalance ? parseFloat(newResellerTokenBalance) : 0;
    if (newResellerTokenBalance && isNaN(tokenBalance)) {
      toast.error("Solde de jetons invalide");
      return;
    }

    // Créer le revendeur
    const result = createReseller(
      newResellerUsername,
      fullPhoneNumber,
      newResellerEmail,
      newResellerPassword,
      tokenBalance
    );

    if (result.success) {
      toast.success(result.message);
      // Réinitialiser le formulaire
      setNewResellerUsername("");
      setNewResellerPhone("");
      setNewResellerEmail("");
      setNewResellerPassword("");
      setNewResellerTokenBalance("");
      setNewResellerCountryCode("+228");
      setCreateModal({ isOpen: false });
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8" key={refreshKey}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestion des Revendeurs</h1>
          <p className="text-sm md:text-base text-muted-foreground">Gérer tous les comptes revendeurs</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
          <Button
            onClick={() => setCreateModal({ isOpen: true })}
            className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un revendeur
          </Button>
          <Input
            placeholder="Rechercher un revendeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-60 md:w-80"
          />
          <Badge variant="outline" className="text-sm md:text-base px-3 md:px-4 py-2 text-center">
            {filteredResellers.length} revendeur{filteredResellers.length > 1 ? 's' : ''}
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
              <TableHead>Solde de Jetons</TableHead>
              <TableHead>Transactions du jour</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResellers.map((reseller) => (
              <TableRow key={reseller.phoneNumber} className="border-border hover:bg-accent/30">
                <TableCell className="font-medium">{reseller.username}</TableCell>
                <TableCell>+{reseller.phoneNumber}</TableCell>
                <TableCell>{reseller.email}</TableCell>
                <TableCell className="text-[#FFD700]">
                  {(reseller.tokenBalance || 0).toLocaleString('fr-FR')} F
                </TableCell>
                <TableCell>{reseller.dailyTransactionsCount || 0}</TableCell>
                <TableCell>
                  <Badge 
                    variant={reseller.status === 'suspended' ? 'destructive' : 'default'}
                    className={reseller.status === 'suspended' ? '' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {reseller.status === 'suspended' ? 'Suspendu' : 'Actif'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewDetails(reseller)}
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

      {/* Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredResellers.map((reseller) => (
          <Card key={reseller.phoneNumber} className="p-4 border-border">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-foreground">{reseller.username}</p>
                  <p className="text-sm text-muted-foreground">+{reseller.phoneNumber}</p>
                  <p className="text-xs text-muted-foreground truncate">{reseller.email}</p>
                </div>
                <Badge 
                  variant={reseller.status === 'suspended' ? 'destructive' : 'default'}
                  className={reseller.status === 'suspended' ? 'text-xs' : 'bg-green-600 text-xs'}
                >
                  {reseller.status === 'suspended' ? 'Suspendu' : 'Actif'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Solde Jetons</p>
                  <p className="font-medium text-[#FFD700]">{(reseller.tokenBalance || 0).toLocaleString('fr-FR')} F</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Transactions/jour</p>
                  <p className="font-medium">{reseller.dailyTransactionsCount || 0}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleViewDetails(reseller)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir les détails
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal Création de Revendeur */}
      <Dialog open={createModal.isOpen} onOpenChange={(open) => setCreateModal({ isOpen: open })}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Créer un nouveau revendeur</DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire de création d'un nouveau compte revendeur
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Nom d'utilisateur */}
            <div className="space-y-2">
              <Label htmlFor="username">Nom d'utilisateur *</Label>
              <Input
                id="username"
                placeholder="Ex: SUPER_LOTO"
                value={newResellerUsername}
                onChange={(e) => setNewResellerUsername(e.target.value)}
              />
            </div>

            {/* Numéro de téléphone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Numéro de téléphone *</Label>
              <div className="flex gap-2">
                <Select
                  value={newResellerCountryCode}
                  onValueChange={setNewResellerCountryCode}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.code}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  placeholder="90 12 34 56"
                  value={newResellerPhone}
                  onChange={(e) => setNewResellerPhone(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="revendeur@example.com"
                value={newResellerEmail}
                onChange={(e) => setNewResellerEmail(e.target.value)}
              />
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimum 6 caractères"
                value={newResellerPassword}
                onChange={(e) => setNewResellerPassword(e.target.value)}
              />
            </div>

            {/* Solde de tokens (optionnel) */}
            <div className="space-y-2">
              <Label htmlFor="tokenBalance">Solde de jetons initial (optionnel)</Label>
              <Input
                id="tokenBalance"
                type="number"
                placeholder="0"
                value={newResellerTokenBalance}
                onChange={(e) => setNewResellerTokenBalance(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateModal({ isOpen: false })}>
              Annuler
            </Button>
            <Button
              onClick={handleCreateReseller}
              className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90"
            >
              Créer le revendeur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Détails */}
      <Dialog open={detailsModal.isOpen} onOpenChange={(open) => setDetailsModal({ ...detailsModal, isOpen: open })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-card border-border">
          <DialogHeader>
            <DialogTitle>Détails du revendeur : {detailsModal.reseller?.username}</DialogTitle>
            <DialogDescription className="sr-only">
              Informations détaillées et actions administrateur pour ce revendeur
            </DialogDescription>
          </DialogHeader>

          {detailsModal.reseller && (
            <div className="space-y-6 overflow-y-auto scrollbar-visible flex-1">
              {/* Informations générales */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Numéro de téléphone</Label>
                  <p className="font-medium">+{detailsModal.reseller.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{detailsModal.reseller.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Solde de Jetons</Label>
                  <p className="font-medium text-[#FFD700]">
                    {(detailsModal.reseller.tokenBalance || 0).toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Transactions du jour</Label>
                  <p className="font-medium">{detailsModal.reseller.dailyTransactionsCount || 0}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rechargement du jour</Label>
                  <p className="font-medium">
                    {(detailsModal.reseller.dailyRechargeTotal || 0).toLocaleString('fr-FR')} F CFA
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Statut</Label>
                  <Badge 
                    variant={detailsModal.reseller.status === 'suspended' ? 'destructive' : 'default'}
                    className={detailsModal.reseller.status === 'suspended' ? '' : 'bg-green-600'}
                  >
                    {detailsModal.reseller.status === 'suspended' ? 'Suspendu' : 'Actif'}
                  </Badge>
                </div>
              </div>

              {/* Historique des recharges (dernières 5) */}
              <div>
                <Label className="text-muted-foreground mb-2 block">Historique des recharges récentes</Label>
                <div className="border border-border rounded-lg p-4 max-h-40 overflow-y-auto scrollbar-visible">
                  {detailsModal.reseller.transactionHistory?.slice(0, 5).map((tx: any, i: number) => (
                    <div key={i} className="text-sm py-2 border-b border-border last:border-0">
                      <div className="flex justify-between">
                        <span>{tx.playerUsername} ({tx.playerNumber})</span>
                        <span className="text-[#FF6B00]">
                          {tx.amount.toLocaleString('fr-FR')} F
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(tx.date).toLocaleString('fr-FR')}
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground text-sm">Aucune transaction</p>}
                </div>
              </div>

              {/* Actions admin */}
              <div className="border-t border-border pt-4 space-y-4">
                <Label>Actions administrateur</Label>
                
                {/* Ajuster les jetons */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Montant (ex: 5000 ou -5000)"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Raison de l'ajustement"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAdjustTokens(detailsModal.reseller.phoneNumber)}
                  >
                    Ajuster Solde de Jetons
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant={detailsModal.reseller?.status === 'suspended' ? 'default' : 'destructive'}
              onClick={() => handleToggleStatus(detailsModal.reseller.phoneNumber)}
            >
              {detailsModal.reseller?.status === 'suspended' ? (
                <><CheckCircle className="h-4 w-4 mr-2" /> Réactiver</>
              ) : (
                <><Ban className="h-4 w-4 mr-2" /> Suspendre</>
              )}
            </Button>
            <Button variant="outline" onClick={() => setDetailsModal({ ...detailsModal, isOpen: false })}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}