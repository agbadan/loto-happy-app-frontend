import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner@2.0.3";
import { Plus, Eye, FileDown, FileSpreadsheet, Calendar, Trophy, Timer, Clock, Info } from "lucide-react";
import { getDraws, DrawExtended, submitDrawResults, updateDrawStatuses, getTicketsForDraw } from "../../utils/draws";
import { OPERATORS_CONFIG, getOperatorById, BET_TYPES_CONFIG, BetType, createDraw, getDefaultMultipliers } from "../../utils/games";

export function AdminGames() {
  const [showReport, setShowReport] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<DrawExtended | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedPendingDraw, setSelectedPendingDraw] = useState<DrawExtended | null>(null);
  const [winningNumbers, setWinningNumbers] = useState<string>("");
  
  // États pour les tirages
  const [upcomingDraws, setUpcomingDraws] = useState<DrawExtended[]>([]);
  const [pendingResults, setPendingResults] = useState<DrawExtended[]>([]);
  const [archivedDraws, setArchivedDraws] = useState<DrawExtended[]>([]);
  
  // Formulaire de création
  const [newDraw, setNewDraw] = useState({
    operatorId: "",
    date: "",
    time: "",
  });
  
  // États pour les multiplicateurs
  const [multipliers, setMultipliers] = useState(getDefaultMultipliers());

  // Charger les tirages au montage
  useEffect(() => {
    updateDrawStatuses();
    loadDraws();
  }, []);

  const loadDraws = () => {
    const allDraws = getDraws();
    setUpcomingDraws(allDraws.filter(d => d.status === 'upcoming'));
    setPendingResults(allDraws.filter(d => d.status === 'pending'));
    setArchivedDraws(allDraws.filter(d => d.status === 'completed'));
  };

  const handleViewReport = (draw: DrawExtended) => {
    setSelectedDraw(draw);
    setShowReport(true);
  };

  const handleCreateDraw = () => {
    if (!newDraw.operatorId || !newDraw.date || !newDraw.time) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    
    const operator = getOperatorById(newDraw.operatorId);
    if (!operator) {
      toast.error("Opérateur invalide");
      return;
    }
    
    // Créer le tirage avec les multiplicateurs
    const currentUser = JSON.parse(localStorage.getItem('lottoHappyUser') || '{}');
    createDraw(
      newDraw.operatorId,
      newDraw.date,
      newDraw.time,
      multipliers,
      currentUser.id || 'admin'
    );
    
    toast.success(`Nouveau tirage créé pour ${operator.name}`);
    setShowCreateModal(false);
    setNewDraw({ operatorId: "", date: "", time: "" });
    setMultipliers(getDefaultMultipliers());
    loadDraws();
  };

  const handleSaveResults = () => {
    if (!selectedPendingDraw || !winningNumbers) {
      toast.error("Veuillez saisir les numéros gagnants");
      return;
    }
    
    // Valider le format des numéros
    const numbers = winningNumbers.split(',').map(n => n.trim()).filter(n => n);
    
    if (numbers.length !== 5) {
      toast.error("Vous devez saisir exactement 5 numéros gagnants");
      return;
    }
    
    // Valider que ce sont bien des numéros entre 1 et 90
    const numbersArray = numbers.map(n => parseInt(n));
    if (numbersArray.some(n => isNaN(n) || n < 1 || n > 90)) {
      toast.error("Les numéros doivent être entre 1 et 90");
      return;
    }
    
    // Soumettre les résultats et distribuer les gains
    submitDrawResults(selectedPendingDraw.id, numbersArray);
    
    toast.success("Résultats enregistrés avec succès ! Les gains ont été distribués.");
    setShowResultsModal(false);
    setSelectedPendingDraw(null);
    setWinningNumbers("");
    loadDraws();
  };

  const handleExportPDF = () => {
    if (!selectedDraw) return;
    toast.info("Exportation PDF en cours... (Fonctionnalité de démonstration)");
  };

  const handleExportExcel = () => {
    if (!selectedDraw) return;
    toast.info("Exportation Excel en cours... (Fonctionnalité de démonstration)");
  };

  // Vue du rapport détaillé
  if (showReport && selectedDraw) {
    const tickets = getTicketsForDraw(selectedDraw.id);
    const winners = tickets.filter(t => t.status === 'won');
    const operator = getOperatorById(selectedDraw.operatorId);

    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
        {/* Header avec boutons d'export */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Button variant="ghost" onClick={() => setShowReport(false)} className="mb-2 text-sm md:text-base">
              ← Retour aux archives
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{operator?.icon || '🎲'}</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Rapport de Tirage</h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {operator?.name} ({operator?.country}) - {new Date(selectedDraw.date).toLocaleDateString('fr-FR')} à {selectedDraw.time}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-xs md:text-sm">
              <FileDown className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exporter Gagnants (PDF)</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="text-xs md:text-sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exporter Participants (Excel)</span>
              <span className="sm:hidden">Excel</span>
            </Button>
          </div>
        </div>

        {/* Section 1 : Résumé */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-1">Numéros Gagnants</p>
            <p className="text-xl font-bold text-[#FFD700]">
              {selectedDraw.winningNumbers?.join(', ') || 'N/A'}
            </p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Mises</p>
            <p className="text-xl font-bold text-foreground">
              {selectedDraw.totalBets?.toLocaleString('fr-FR') || 0} F
            </p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-1">Total Gains</p>
            <p className="text-xl font-bold text-[#FF6B00]">
              {selectedDraw.totalWinnings?.toLocaleString('fr-FR') || 0} F
            </p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-sm text-muted-foreground mb-1">Bénéfice</p>
            <p className={`text-xl font-bold ${(selectedDraw.profit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {selectedDraw.profit?.toLocaleString('fr-FR') || 0} F
            </p>
          </Card>
        </div>

        {/* Section 2 : Liste des Gagnants */}
        <Card className="border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#FFD700]" />
              Liste des Gagnants ({winners.length})
            </h3>
          </div>
          {winners.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucun gagnant pour ce tirage
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Nom d'utilisateur</TableHead>
                    <TableHead>Type de pari</TableHead>
                    <TableHead>Numéros joués</TableHead>
                    <TableHead>Mise</TableHead>
                    <TableHead className="text-right">Montant gagné</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {winners.map((winner) => (
                    <TableRow key={winner.id} className="border-border">
                      <TableCell className="font-medium">{winner.username}</TableCell>
                      <TableCell>
                        <Badge className="bg-[#4F00BC]/20 text-[#4F00BC] border-[#4F00BC]/30">
                          {winner.betType || 'NAP2'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[#FFD700] font-semibold">{winner.numbers}</TableCell>
                      <TableCell>{winner.betAmount.toLocaleString('fr-FR')} F</TableCell>
                      <TableCell className="text-right font-bold text-green-500">
                        {winner.winAmount?.toLocaleString('fr-FR')} F
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Section 3 : Liste de tous les Participants */}
        <Card className="border-border">
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-bold text-foreground">
              Liste de tous les Participants ({tickets.length})
            </h3>
          </div>
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Aucun participant pour ce tirage
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Nom d'utilisateur</TableHead>
                    <TableHead>Type de pari</TableHead>
                    <TableHead>Numéros joués</TableHead>
                    <TableHead>Mise</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tickets.map((ticket) => (
                    <TableRow key={ticket.id} className="border-border">
                      <TableCell className="font-medium">{ticket.username}</TableCell>
                      <TableCell>
                        <Badge className="bg-muted text-muted-foreground border-border">
                          {ticket.betType || 'NAP2'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{ticket.numbers}</TableCell>
                      <TableCell>{ticket.betAmount.toLocaleString('fr-FR')} F</TableCell>
                      <TableCell>
                        {ticket.status === 'won' ? (
                          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                            Gagnant
                          </Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-border">
                            Perdant
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Vue principale
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
          Gestion des Tirages
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
          Créez des tirages, saisissez les résultats et consultez les archives
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4 sm:space-y-6">
        <div className="w-full overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-3 bg-muted h-auto">
            <TabsTrigger 
              value="upcoming" 
              className="flex items-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>À Venir</span>
              <Badge className="bg-[#009DD9]/20 text-[#009DD9] border-[#009DD9]/30 text-xs px-1.5">
                {upcomingDraws.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="flex items-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              <Timer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Résultats</span>
              <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30 text-xs px-1.5">
                {pendingResults.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="archived" 
              className="flex items-center gap-1.5 sm:gap-2 py-2 px-3 sm:px-4 text-xs sm:text-sm whitespace-nowrap flex-shrink-0"
            >
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Archives</span>
              <Badge className="bg-muted text-muted-foreground border-border text-xs px-1.5">
                {archivedDraws.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Tirages à venir */}
        <TabsContent value="upcoming" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90 text-xs sm:text-sm px-3 sm:px-4"
            >
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Nouveau</span> Tirage
            </Button>
          </div>

          {upcomingDraws.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center border-border">
              <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <p className="text-sm sm:text-base text-muted-foreground">Aucun tirage à venir</p>
              <Button
                variant="outline"
                className="mt-3 sm:mt-4 text-xs sm:text-sm"
                onClick={() => setShowCreateModal(true)}
              >
                Créer un tirage
              </Button>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {upcomingDraws.map((draw) => {
                const operator = getOperatorById(draw.operatorId);
                return (
                  <Card key={draw.id} className="p-3 sm:p-4 md:p-6 border-border">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                        <span className="text-2xl sm:text-3xl md:text-4xl">{operator?.icon || '🎲'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base md:text-lg text-foreground break-words">
                            {operator?.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {operator?.country}
                          </p>
                          <div className="mt-2 flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              <span className="whitespace-nowrap">{new Date(draw.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              <span>{draw.time}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {draw.participants || 0} participant(s)
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Résultats en attente */}
        <TabsContent value="pending" className="space-y-4">
          {pendingResults.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center border-border">
              <Timer className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <p className="text-sm sm:text-base text-muted-foreground">Aucun tirage en attente de résultats</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {pendingResults.map((draw) => {
                const operator = getOperatorById(draw.operatorId);
                return (
                  <Card key={draw.id} className="p-3 sm:p-4 md:p-6 border-border">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                        <span className="text-2xl sm:text-3xl md:text-4xl">{operator?.icon || '🎲'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base md:text-lg text-foreground break-words">
                            {operator?.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {operator?.country}
                          </p>
                          <div className="mt-2 flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              <span className="whitespace-nowrap">{new Date(draw.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              <span>{draw.time}</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {draw.participants || 0} participant(s)
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => {
                          setSelectedPendingDraw(draw);
                          setShowResultsModal(true);
                        }}
                        className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        Saisir Résultats
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Archives */}
        <TabsContent value="archived" className="space-y-4">
          {archivedDraws.length === 0 ? (
            <Card className="p-6 sm:p-8 text-center border-border">
              <Trophy className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <p className="text-sm sm:text-base text-muted-foreground">Aucun tirage archivé</p>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {archivedDraws.map((draw) => {
                const operator = getOperatorById(draw.operatorId);
                return (
                  <Card key={draw.id} className="p-3 sm:p-4 md:p-6 border-border">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                      <div className="flex items-start gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                        <span className="text-2xl sm:text-3xl md:text-4xl">{operator?.icon || '🎲'}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm sm:text-base md:text-lg text-foreground break-words">
                            {operator?.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {operator?.country}
                          </p>
                          <div className="mt-2 flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              <span className="whitespace-nowrap">{new Date(draw.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                              <span>{draw.time}</span>
                            </div>
                          </div>
                          <p className="text-xs text-[#FFD700] font-semibold mt-2">
                            Numéros: {draw.winningNumbers?.join(', ') || 'N/A'}
                          </p>
                          <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 text-xs">
                            <span className="text-muted-foreground">
                              {draw.participants || 0} participants
                            </span>
                            <span className="text-green-500">
                              {draw.winners || 0} gagnant(s)
                            </span>
                            <span className="text-foreground">
                              Profit: {draw.profit?.toLocaleString('fr-FR') || 0} F
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleViewReport(draw)}
                        className="text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <Eye className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Voir Rapport
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal: Créer un nouveau tirage */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Créer un Nouveau Tirage</DialogTitle>
            <DialogDescription>
              Sélectionnez l'opérateur, la date/heure et configurez les multiplicateurs
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Sélection de l'opérateur */}
            <div className="space-y-2">
              <Label htmlFor="operator">Opérateur *</Label>
              <Select
                value={newDraw.operatorId}
                onValueChange={(value) => setNewDraw({ ...newDraw, operatorId: value })}
              >
                <SelectTrigger id="operator">
                  <SelectValue placeholder="Choisir un opérateur" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS_CONFIG.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      <div className="flex items-center gap-2">
                        <span>{operator.icon}</span>
                        <span>{operator.name} ({operator.country})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date et Heure */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date du tirage *</Label>
                <Input
                  id="date"
                  type="date"
                  value={newDraw.date}
                  onChange={(e) => setNewDraw({ ...newDraw, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Heure du tirage *</Label>
                <Input
                  id="time"
                  type="time"
                  value={newDraw.time}
                  onChange={(e) => setNewDraw({ ...newDraw, time: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            {/* Multiplicateurs */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-[#FFD700]" />
                <Label className="text-base">Multiplicateurs de Gains</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Configurez les multiplicateurs pour chaque type de pari. Le gain = Mise × Multiplicateur.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(BET_TYPES_CONFIG).map((betTypeKey) => {
                  const betType = betTypeKey as BetType;
                  const config = BET_TYPES_CONFIG[betType];
                  return (
                    <div key={betType} className="space-y-2">
                      <Label htmlFor={betType} className="text-xs">
                        {config.icon} {config.name}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={betType}
                          type="number"
                          min="1"
                          value={multipliers[betType]}
                          onChange={(e) =>
                            setMultipliers({
                              ...multipliers,
                              [betType]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="text-sm"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">× la mise</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateDraw} className="bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90">
              Créer le Tirage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Saisir les résultats */}
      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Saisir les Résultats</DialogTitle>
            <DialogDescription>
              Entrez les 5 numéros gagnants (de 1 à 90), séparés par des virgules
            </DialogDescription>
          </DialogHeader>

          {selectedPendingDraw && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Tirage</p>
                <p className="font-bold text-foreground">
                  {getOperatorById(selectedPendingDraw.operatorId)?.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(selectedPendingDraw.date).toLocaleDateString('fr-FR')} à {selectedPendingDraw.time}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="winning-numbers">
                  Numéros Gagnants (5 numéros) *
                </Label>
                <Input
                  id="winning-numbers"
                  type="text"
                  placeholder="Ex: 5, 12, 23, 45, 67"
                  value={winningNumbers}
                  onChange={(e) => setWinningNumbers(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Entrez exactement 5 numéros entre 1 et 90, séparés par des virgules.
                  L'ordre est important pour les paris CHANCE+.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResultsModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveResults} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90">
              Enregistrer et Distribuer les Gains
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
