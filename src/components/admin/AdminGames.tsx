// src/components/admin/AdminGames.tsx

import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { Plus, Calendar, Trophy, Timer, Clock, Info, Loader2 } from "lucide-react";
import { Draw, Multipliers, getAdminDrawsByStatus, createAdminDraw, publishDrawResults } from "../../utils/drawsAPI";

const OPERATORS_CONFIG = [
    { id: 'benin-lotto', name: 'Bénin Lotto', icon: '🇧🇯', country: 'Bénin' },
    { id: 'lotto-kadoo-togo', name: 'Lotto Kadoo', icon: '🇹🇬', country: 'Togo' },
    { id: 'lonaci-ci', name: 'Lonaci', icon: '🇨🇮', country: 'Côte d\'Ivoire' },
    { id: 'green-lotto-nigeria', name: 'Green Lotto', icon: '🇳🇬', country: 'Nigéria' },
    { id: 'pmu-senegal', name: 'PMU Sénégal', icon: '🇸🇳', country: 'Sénégal' },
];

const BET_TYPES_CONFIG: Record<string, { name: string; label: string }> = {
    'NAP1': { name: 'Simple Numéro', label: 'NAP1' }, 'NAP2': { name: 'Deux Numéros', label: 'NAP2 / Two Sure' },
    'NAP3': { name: 'Trois Numéros', label: 'NAP3' }, 'NAP4': { name: 'Quatre Numéros', label: 'NAP4' },
    'NAP5': { name: 'Cinq Numéros', label: 'NAP5 / Perm Nap' }, 'PERMUTATION': { name: 'Combinaison', label: 'Permutation' },
    'BANKA': { name: 'Numéro de Base', label: 'Against / Banka' }, 'CHANCE_PLUS': { name: 'Position Exacte', label: 'Chance+' },
    'ANAGRAMME': { name: 'Numéros inversés', label: 'Anagramme / WE dans WE' },
};

const getDefaultMultipliers = (): Multipliers => ({
    'NAP1': 10, 'NAP2': 500, 'NAP3': 2500, 'NAP4': 10000, 'NAP5': 100000,
    'PERMUTATION': 500, 'BANKA': 500, 'CHANCE_PLUS': 90, 'ANAGRAMME': 10,
});

type AdminDrawStatus = 'upcoming' | 'completed' | 'archived' | 'cancelled';

export function AdminGames() {
    const [activeTab, setActiveTab] = useState<AdminDrawStatus>('upcoming');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draws, setDraws] = useState<Draw[]>([]);
    
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [selectedDrawForResults, setSelectedDrawForResults] = useState<Draw | null>(null);
    const [winningNumbers, setWinningNumbers] = useState<string>("");

    const [newDraw, setNewDraw] = useState({ operatorId: "", date: "", time: "" });
    const [multipliers, setMultipliers] = useState<Multipliers>(getDefaultMultipliers());

    useEffect(() => { loadDraws(activeTab); }, [activeTab]);

    const loadDraws = async (status: AdminDrawStatus) => {
        setIsLoading(true); setDraws([]);
        try { const fetchedDraws = await getAdminDrawsByStatus(status); setDraws(fetchedDraws); } 
        catch (error) { toast.error("Impossible de charger les tirages."); } 
        finally { setIsLoading(false); }
    };

    const handleCreateDraw = async () => {
        if (!newDraw.operatorId || !newDraw.date || !newDraw.time) return toast.error("Veuillez remplir tous les champs.");
        setIsSubmitting(true);
        try {
            await createAdminDraw({ ...newDraw, multipliers });
            toast.success("Tirage créé !");
            setShowCreateModal(false); setNewDraw({ operatorId: "", date: "", time: "" }); setMultipliers(getDefaultMultipliers());
            if (activeTab === 'upcoming') { loadDraws('upcoming'); } else { setActiveTab('upcoming'); }
        } catch (error) { toast.error("Erreur lors de la création du tirage."); } 
        finally { setIsSubmitting(false); }
    };

    const handleSaveResults = async () => {
        if (!selectedDrawForResults || !winningNumbers) return;
        const numbersArray = winningNumbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (numbersArray.length === 0) return toast.error("Numéros invalides.");
        setIsSubmitting(true);
        try {
            await publishDrawResults(selectedDrawForResults.id, numbersArray);
            toast.success("Résultats enregistrés !");
            setShowResultsModal(false); setWinningNumbers(""); loadDraws(activeTab);
        } catch (error) { toast.error("Erreur lors de la soumission."); } 
        finally { setIsSubmitting(false); }
    };

    const DrawList = ({ drawList }: { drawList: Draw[] }) => (
      <div className="grid gap-4">{drawList.map((draw) => {
          // CORRECTION: On cherche l'opérateur en comparant son nom, car l'API ne renvoie pas d'ID d'opérateur
          const operator = OPERATORS_CONFIG.find(op => op.name === draw.operatorName);
          
          // CORRECTION: On utilise le champ `drawDate` qui contient date ET heure
          const drawDate = new Date(draw.drawDate);
          const formattedDate = !isNaN(drawDate.getTime()) ? drawDate.toLocaleDateString('fr-FR') : "Date invalide";
          const formattedTime = !isNaN(drawDate.getTime()) ? drawDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "";

          return (
            <Card key={draw.id} className="p-4 md:p-6">
              <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                      <span className="text-3xl pt-1">{operator?.icon || '🎲'}</span>
                      <div>
                          {/* CORRECTION: On utilise `draw.operatorName` */}
                          <h3 className="font-bold text-lg">{draw.operatorName || 'Inconnu'}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>{formattedDate}</span></div>
                              <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>{formattedTime}</span></div>
                          </div>
                          {/* CORRECTION: On utilise `draw.winningNumbers` */}
                          {draw.winningNumbers && <p className="text-sm font-semibold mt-2 text-yellow-400">Numéros: {draw.winningNumbers.join(', ')}</p>}
                      </div>
                  </div>
                  {activeTab === 'completed' && (<Button size="sm" onClick={() => { setSelectedDrawForResults(draw); setShowResultsModal(true); }} className="bg-orange-500 hover:bg-orange-600 text-white">Saisir Résultats</Button>)}
              </div>
            </Card>
          );
      })}</div>
    );
    
    return (
        <div className="p-4 md:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Gestion des Tirages</h1>
                <p className="text-muted-foreground mt-1">Créez des tirages, saisissez les résultats et consultez les archives</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminDrawStatus)} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                    <TabsTrigger value="upcoming">À Venir</TabsTrigger>
                    <TabsTrigger value="completed">Résultats</TabsTrigger>
                    <TabsTrigger value="archived">Archives</TabsTrigger>
                </TabsList>
                
                <div>
                    {activeTab === 'upcoming' && (
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setShowCreateModal(true)} className="bg-yellow-400 text-black hover:bg-yellow-500">
                                <Plus className="mr-2 h-4 w-4"/>Nouveau Tirage
                            </Button>
                        </div>
                    )}
                    {isLoading ? <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div> : draws.length === 0 ? <Card className="p-12 text-center text-muted-foreground">Aucun tirage à afficher dans cette section.</Card> : <DrawList drawList={draws} />}
                </div>
            </Tabs>

            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Créer un Nouveau Tirage</DialogTitle>
                        <DialogDescription>Remplissez les informations et configurez les multiplicateurs.</DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-6 overflow-y-auto pr-6">
                        <div className="space-y-2">
                            <Label>Opérateur *</Label>
                            <Select value={newDraw.operatorId} onValueChange={(v) => setNewDraw({...newDraw, operatorId: v})}>
                                <SelectTrigger><SelectValue placeholder="Choisir un opérateur..." /></SelectTrigger>
                                <SelectContent>{OPERATORS_CONFIG.map(op => <SelectItem key={op.id} value={op.id}><div className="flex items-center gap-2"><span>{op.icon}</span><span>{op.name} ({op.country})</span></div></SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Date *</Label><Input type="date" value={newDraw.date} onChange={(e) => setNewDraw({...newDraw, date: e.target.value})} /></div>
                            <div><Label>Heure *</Label><Input type="time" value={newDraw.time} onChange={(e) => setNewDraw({...newDraw, time: e.target.value})} /></div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-center gap-2"><Info className="h-4 w-4 text-yellow-400" /><Label className="text-base">Multiplicateurs de Gains</Label></div>
                            <p className="text-xs text-muted-foreground">Configurez les multiplicateurs pour chaque type de pari. Le gain = Mise × Multiplicateur.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                {Object.keys(BET_TYPES_CONFIG).map(key => {
                                    const config = BET_TYPES_CONFIG[key];
                                    return (
                                        <div key={key}>
                                            <Label htmlFor={key} className="text-sm font-medium">{config.name} <span className="text-xs text-muted-foreground">({config.label})</span></Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Input id={key} type="number" value={multipliers[key] || ''} onChange={(e) => setMultipliers({...multipliers, [key]: Number(e.target.value)})} />
                                                <span className="text-sm text-muted-foreground">×</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t mt-auto">
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>Annuler</Button>
                        <Button onClick={handleCreateDraw} disabled={isSubmitting} className="bg-yellow-400 text-black hover:bg-yellow-500">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Créer Tirage</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Saisir les Résultats</DialogTitle><DialogDescription>Entrez les numéros gagnants séparés par une virgule.</DialogDescription></DialogHeader>
                    <div className="py-4"><Label>Numéros Gagnants *</Label><Input placeholder="ex: 5, 12, 23, 45, 67" value={winningNumbers} onChange={(e) => setWinningNumbers(e.target.value)} /></div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowResultsModal(false)}>Annuler</Button><Button onClick={handleSaveResults} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Enregistrer</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}