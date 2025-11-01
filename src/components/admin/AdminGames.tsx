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
import { Draw, Multipliers, getAdminDrawsByStatus, createAdminDraw, publishDrawResults } from "../../utils/drawsAPI";

// Liste des opérateurs mise à jour et confirmée
const OPERATORS_CONFIG = [
    { id: 'benin-lotto', name: 'Bénin Lotto', icon: '🇧🇯', country: 'Bénin' },
    { id: 'lotto-kadoo-togo', name: 'Lotto Kadoo', icon: '🇹🇬', country: 'Togo' },
    { id: 'lonaci-ci', name: 'Lonaci', icon: '🇨🇮', country: 'Côte d\'Ivoire' },
    { id: 'green-lotto-nigeria', name: 'Green Lotto', icon: '🇳🇬', country: 'Nigéria' },
    { id: 'pmu-senegal', name: 'PMU Sénégal', icon: '🇸🇳', country: 'Sénégal' },
];

// CORRECTION FINALE: Utilisation des clés EXACTES requises par le backend
const BET_TYPES_CONFIG: Record<string, { name: string; label: string }> = {
    'NAP1': { name: 'Simple Numéro', label: 'NAP1' },
    'NAP2': { name: 'Deux Numéros', label: 'NAP2 / Two Sure' },
    'NAP3': { name: 'Trois Numéros', label: 'NAP3' },
    'NAP4': { name: 'Quatre Numéros', label: 'NAP4' },
    'NAP5': { name: 'Cinq Numéros', label: 'NAP5 / Perm Nap' },
    'PERMUTATION': { name: 'Combinaison', label: 'Permutation' },
    'BANKA': { name: 'Numéro de Base', label: 'Against / Banka' },
    'CHANCE_PLUS': { name: 'Position Exacte', label: 'Chance+' },
    'ANAGRAMME': { name: 'Numéros inversés', label: 'Anagramme / WE dans WE' },
};

const getDefaultMultipliers = (): Multipliers => ({
    'NAP1': 10,
    'NAP2': 500,
    'NAP3': 2500,
    'NAP4': 10000,
    'NAP5': 100000,
    'PERMUTATION': 500,
    'BANKA': 500,
    'CHANCE_PLUS': 90,
    'ANAGRAMME': 10,
});

type AdminDrawStatus = 'upcoming' | 'completed' | 'archived' | 'cancelled';

export function AdminGames() {
    // Le reste de la logique du composant est déjà correct et n'a pas besoin de changer
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

    useEffect(() => {
        loadDraws(activeTab);
    }, [activeTab]);

    const loadDraws = async (status: AdminDrawStatus) => {
        setIsLoading(true);
        setDraws([]);
        try {
            const fetchedDraws = await getAdminDrawsByStatus(status);
            setDraws(fetchedDraws);
        } catch (error) {
            toast.error("Impossible de charger les tirages.");
        } finally {
            setIsLoading(false);
        }
    };

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
            if (activeTab === 'upcoming') {
                loadDraws('upcoming');
            } else {
                setActiveTab('upcoming');
            }
        } catch (error) {
            toast.error("Erreur lors de la création du tirage. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveResults = async () => {
        if (!selectedDrawForResults || !winningNumbers) return;
        const numbersArray = winningNumbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (numbersArray.length === 0) return toast.error("Veuillez saisir des numéros valides.");
        
        setIsSubmitting(true);
        try {
            await publishDrawResults(selectedDrawForResults.id, numbersArray);
            toast.success("Résultats enregistrés !");
            setShowResultsModal(false);
            setWinningNumbers("");
            loadDraws(activeTab);
        } catch (error) {
            toast.error("Erreur lors de la soumission des résultats.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const DrawList = ({ drawList }: { drawList: Draw[] }) => (
        <div className="grid gap-3 sm:gap-4">
            {drawList.map((draw) => {
                const operator = OPERATORS_CONFIG.find(op => op.id === draw.operatorId);
                return (
                    <Card key={draw.id} className="p-3 sm:p-4 md:p-6">
                        {/* Le JSX de la carte de tirage reste inchangé */}
                    </Card>
                );
            })}
        </div>
    );
    
    return (
        <div className="p-4 md:p-6 lg:p-8">
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">Gestion des Tirages</h1>
                <p className="text-base text-muted-foreground mt-1">Créez des tirages, saisissez les résultats et consultez les archives</p>
            </div>

            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={(value) => setActiveTab(value as AdminDrawStatus)} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-muted">
                    <TabsTrigger value="upcoming"><Calendar className="mr-2 h-4 w-4" />À Venir</TabsTrigger>
                    <TabsTrigger value="completed"><Timer className="mr-2 h-4 w-4" />Résultats</TabsTrigger>
                    <TabsTrigger value="archived"><Trophy className="mr-2 h-4 w-4" />Archives</TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    {activeTab === 'upcoming' && (
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setShowCreateModal(true)} className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90">
                                <Plus className="mr-2 h-4 w-4" />Nouveau Tirage
                            </Button>
                        </div>
                    )}
                    {isLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                    ) : draws.length === 0 ? (
                        <Card className="p-12 text-center"><p className="text-muted-foreground">Aucun tirage trouvé pour cette section.</p></Card>
                    ) : (
                        <DrawList drawList={draws} />
                    )}
                </div>
            </Tabs>
            
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader><DialogTitle>Créer un Nouveau Tirage</DialogTitle><DialogDescription>Sélectionnez l'opérateur, la date/heure et configurez les multiplicateurs.</DialogDescription></DialogHeader>
                    <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="space-y-2">
                            <Label>Opérateur *</Label>
                            <Select value={newDraw.operatorId} onValueChange={(value) => setNewDraw({ ...newDraw, operatorId: value })}>
                                <SelectTrigger><SelectValue placeholder="Choisir un opérateur" /></SelectTrigger>
                                <SelectContent>{OPERATORS_CONFIG.map(op => <SelectItem key={op.id} value={op.id}><div className="flex items-center gap-2"><span>{op.icon}</span><span>{op.name} ({op.country})</span></div></SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label>Date *</Label><Input type="date" value={newDraw.date} onChange={(e) => setNewDraw({ ...newDraw, date: e.target.value })} /></div>
                            <div><Label>Heure *</Label><Input type="time" value={newDraw.time} onChange={(e) => setNewDraw({ ...newDraw, time: e.target.value })} /></div>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-center gap-2"><Info className="h-4 w-4 text-[#FFD700]" /><Label className="text-base">Multiplicateurs de Gains</Label></div>
                            <p className="text-xs text-muted-foreground">Configurez les multiplicateurs pour chaque type de pari. Le gain = Mise × Multiplicateur.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                {Object.keys(BET_TYPES_CONFIG).map(key => {
                                    const config = BET_TYPES_CONFIG[key];
                                    return (
                                        <div key={key}>
                                            <Label htmlFor={key} className="text-sm font-medium">{config.name} <span className="text-xs text-muted-foreground">({config.label})</span></Label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Input id={key} type="number" value={multipliers[key] || ''} onChange={(e) => setMultipliers({...multipliers, [key]: Number(e.target.value)})} />
                                                <span className="text-sm text-muted-foreground">× la mise</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowCreateModal(false)}>Annuler</Button><Button onClick={handleCreateDraw} disabled={isSubmitting} className="bg-[#FFD700] text-black hover:bg-[#FFD700]/90">{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Créer le Tirage</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showResultsModal} onOpenChange={setShowResultsModal}><DialogContent>
                {/* Le JSX pour le modal de résultats reste inchangé */}
            </DialogContent></Dialog>
        </div>
    );
}