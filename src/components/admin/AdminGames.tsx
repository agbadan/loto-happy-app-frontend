// src/components/admin/AdminGames.tsx

import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { Plus, Calendar, Trophy, Timer, Clock, Info, Loader2 } from "lucide-react";
// CORRECTION: Imports depuis notre nouveau fichier API
import { Draw, Multipliers, getAdminDrawsByStatus, createAdminDraw, publishDrawResults } from "../../utils/drawsAPI";

// NOTE: Ces configurations restent côté frontend pour l'instant.
// Idéalement, elles pourraient aussi venir d'une API à l'avenir.
const OPERATORS_CONFIG = [
    { id: 'togo-kadoo', name: 'Lotto Kadoo', icon: '🇰', country: 'Togo' },
    // Ajoutez d'autres opérateurs ici si nécessaire
];
const BET_TYPES_CONFIG: Record<string, { name: string; icon: string }> = {
    'NAP2': { name: 'NAP 2', icon: '2️⃣' },
    'NAP3': { name: 'NAP 3', icon: '3️⃣' },
    // Ajoutez d'autres types de paris ici
};
const getDefaultMultipliers = (): Multipliers => ({ 'NAP2': 240, 'NAP3': 2100 });

type AdminDrawStatus = 'upcoming' | 'completed' | 'archived' | 'cancelled';

export function AdminGames() {
  // --- États pour la gestion de l'UI ---
  const [activeTab, setActiveTab] = useState<AdminDrawStatus>('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // --- États pour les Données ---
  const [draws, setDraws] = useState<Draw[]>([]);
  
  // --- États pour les Modals ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedDrawForResults, setSelectedDrawForResults] = useState<Draw | null>(null);
  const [winningNumbers, setWinningNumbers] = useState<string>("");

  // --- États pour le formulaire de création ---
  const [newDraw, setNewDraw] = useState({ operatorId: "", date: "", time: "" });
  const [multipliers, setMultipliers] = useState<Multipliers>(getDefaultMultipliers());

  // --- Chargement des données en fonction de l'onglet actif ---
  useEffect(() => {
    loadDraws(activeTab);
  }, [activeTab]);

  const loadDraws = async (status: AdminDrawStatus) => {
    setIsLoading(true);
    setDraws([]); // Vider les données précédentes
    try {
      const fetchedDraws = await getAdminDrawsByStatus(status);
      setDraws(fetchedDraws);
    } catch (error) {
      console.error(`Erreur lors du chargement des tirages (${status}):`, error);
      toast.error("Impossible de charger les tirages.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Gestionnaires d'événements (maintenant asynchrones) ---
  const handleCreateDraw = async () => {
    if (!newDraw.operatorId || !newDraw.date || !newDraw.time) {
      return toast.error("Veuillez remplir tous les champs obligatoires.");
    }
    
    setIsSubmitting(true);
    try {
      await createAdminDraw({ ...newDraw, multipliers });
      toast.success("Nouveau tirage créé avec succès !");
      setShowCreateModal(false);
      setNewDraw({ operatorId: "", date: "", time: "" });
      setMultipliers(getDefaultMultipliers());
      // Recharger les données de l'onglet "À Venir" si on est dessus, sinon on n'y touche pas.
      if (activeTab === 'upcoming') {
        loadDraws('upcoming');
      }
    } catch (error) {
      toast.error("Erreur lors de la création du tirage. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveResults = async () => {
    if (!selectedDrawForResults || !winningNumbers) {
      return toast.error("Aucun tirage sélectionné ou numéros manquants.");
    }
    
    const numbersArray = winningNumbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
    // NOTE: La validation de la longueur (ex: 5 numéros) et des limites (1-90) doit être adaptée au type de jeu.
    // Pour cet exemple, on reste simple.
    if (numbersArray.length === 0) {
      return toast.error("Veuillez saisir des numéros gagnants valides.");
    }
    
    setIsSubmitting(true);
    try {
      await publishDrawResults(selectedDrawForResults.id, numbersArray);
      toast.success("Résultats enregistrés avec succès !");
      setShowResultsModal(false);
      setSelectedDrawForResults(null);
      setWinningNumbers("");
      // Recharger les données de l'onglet actuel pour que le tirage disparaisse de la liste "Résultats"
      loadDraws(activeTab);
    } catch (error) {
      toast.error("Erreur lors de la soumission des résultats.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Composant d'affichage pour une liste de tirages ---
  const DrawList = ({ drawList }: { drawList: Draw[] }) => (
    <div className="grid gap-3 sm:gap-4">
      {drawList.map((draw) => {
        const operator = OPERATORS_CONFIG.find(op => op.id === draw.operatorId);
        return (
          <Card key={draw.id} className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                <span className="text-2xl sm:text-3xl md:text-4xl">{operator?.icon || '🎲'}</span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base md:text-lg">{draw.operatorName}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{operator?.country}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{new Date(draw.date).toLocaleDateString('fr-FR')}</span></div>
                    <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-muted-foreground" /><span>{draw.time}</span></div>
                  </div>
                  {draw.winningNumbers && <p className="text-xs text-[#FFD700] font-semibold mt-2">Numéros: {draw.winningNumbers.join(', ')}</p>}
                </div>
              </div>
              {draw.status === 'pending' && ( // "pending" est l'ancien nom, il faudra l'adapter si le backend change
                <Button onClick={() => { setSelectedDrawForResults(draw); setShowResultsModal(true); }} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-xs sm:text-sm w-full sm:w-auto">
                  Saisir Résultats
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Gestion des Tirages</h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">Créez des tirages, saisissez les résultats et consultez les archives</p>
      </div>

      <Tabs defaultValue="upcoming" onValueChange={(value) => setActiveTab(value as AdminDrawStatus)} className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="upcoming"><Calendar className="mr-2 h-4 w-4" />À Venir</TabsTrigger>
            <TabsTrigger value="completed"><Timer className="mr-2 h-4 w-4" />Résultats</TabsTrigger>
            <TabsTrigger value="archived"><Trophy className="mr-2 h-4 w-4" />Archives</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
            {activeTab === 'upcoming' && (
                <div className="flex justify-end mb-4">
                    <Button onClick={() => setShowCreateModal(true)} className="bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90">
                        <Plus className="mr-2 h-4 w-4" />Nouveau Tirage
                    </Button>
                </div>
            )}
            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : draws.length === 0 ? (
                <Card className="p-8 text-center"><p className="text-muted-foreground">Aucun tirage trouvé pour cette section.</p></Card>
            ) : (
                <DrawList drawList={draws} />
            )}
        </TabsContent>
      </Tabs>

      {/* --- MODALS --- */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Créer un Nouveau Tirage</DialogTitle><DialogDescription>Configurez un nouveau tirage et ses multiplicateurs de gains.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="operator" className="text-right">Opérateur</Label>
              <Select value={newDraw.operatorId} onValueChange={(value) => setNewDraw({ ...newDraw, operatorId: value })}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Choisir un opérateur" /></SelectTrigger>
                <SelectContent>{OPERATORS_CONFIG.map(op => <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Date</Label>
              <Input id="date" type="date" value={newDraw.date} onChange={(e) => setNewDraw({ ...newDraw, date: e.target.value })} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">Heure</Label>
              <Input id="time" type="time" value={newDraw.time} onChange={(e) => setNewDraw({ ...newDraw, time: e.target.value })} className="col-span-3" />
            </div>
            <Separator className="my-4" />
            <div className="flex items-center gap-2"><Info className="h-4 w-4 text-[#FFD700]" /><Label className="text-base">Multiplicateurs de Gains</Label></div>
            <div className="grid grid-cols-2 gap-4 pl-12">
              {Object.keys(BET_TYPES_CONFIG).map(key => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{BET_TYPES_CONFIG[key].name}</Label>
                  <Input id={key} type="number" value={multipliers[key] || ''} onChange={(e) => setMultipliers({...multipliers, [key]: Number(e.target.value)})} />
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Annuler</Button>
            <Button onClick={handleCreateDraw} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer le Tirage
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Saisir les Résultats</DialogTitle><DialogDescription>Entrez les numéros gagnants séparés par des virgules.</DialogDescription></DialogHeader>
          <div className="py-4">
            <Label htmlFor="winning-numbers">Numéros Gagnants *</Label>
            <Input id="winning-numbers" placeholder="Ex: 5, 12, 23, 45, 67" value={winningNumbers} onChange={(e) => setWinningNumbers(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResultsModal(false)}>Annuler</Button>
            <Button onClick={handleSaveResults} disabled={isSubmitting} className="bg-[#FF6B00] hover:bg-[#FF6B00]/90">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}