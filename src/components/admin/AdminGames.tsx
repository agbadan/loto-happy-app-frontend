// src/components/admin/AdminGames.tsx

import { useState, useEffect, useMemo } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { Plus, Calendar, Trophy, Timer, Clock, Info, Loader2, Archive, XCircle } from "lucide-react";
// J'ai importé l'API ici, mais assure-toi que le chemin est correct pour ton projet.
import { Draw, Multipliers, getAdminDrawsByStatus, createAdminDraw, publishDrawResults, updateDrawStatus } from "../../utils/drawsAPI";

// --- CONFIGURATIONS (INCHANGÉES) ---
const OPERATORS_CONFIG = [
    { id: 'benin-lotto', name: 'Bénin Lotto', icon: '🇧🇯', country: 'Bénin' },
    { id: 'lotto-kadoo-togo', name: 'Lotto Kadoo', icon: '🇹🇬', country: 'Togo' },
    { id: 'lonaci-ci', name: 'Lonaci', icon: '🇨🇮', country: 'Côte d\'Ivoire' },
    { id: 'green-lotto-nigeria', name: 'Green Lotto', icon: '🇳🇬', country: 'Nigéria' },
    { id: 'pmu-senegal', name: 'PMU Sénégal', icon: '🇸🇳', country: 'Sénégal' },
];

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
    'NAP1': 10, 'NAP2': 500, 'NAP3': 2500, 'NAP4': 10000, 'NAP5': 100000,
    'PERMUTATION': 500, 'BANKA': 500, 'CHANCE_PLUS': 90, 'ANAGRAMME': 10,
});

type AdminDrawStatus = 'upcoming' | 'completed' | 'archived'; // 'cancelled' n'a pas d'onglet dédié

// --- COMPOSANT PRINCIPAL ---
export function AdminGames() {
    const [activeTab, setActiveTab] = useState<AdminDrawStatus>('upcoming');
    const [isLoading, setIsLoading] = useState(true);
    const [draws, setDraws] = useState<Draw[]>([]);
    const [drawsCount, setDrawsCount] = useState({ upcoming: 0, completed: 0, archived: 0 });
    
    // États pour les modales
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isResultsModalOpen, setResultsModalOpen] = useState(false);
    const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);

    // Charger les décomptes au démarrage
    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [upcoming, completed, archived] = await Promise.all([
                    getAdminDrawsByStatus('upcoming', 0, 1),
                    getAdminDrawsByStatus('completed', 0, 1),
                    getAdminDrawsByStatus('archived', 0, 1)
                ]);
                setDrawsCount({
                    upcoming: upcoming.total,
                    completed: completed.total,
                    archived: archived.total
                });
            } catch {
                toast.error("Erreur lors du chargement des décomptes.");
            }
        };
        fetchCounts();
    }, []);

    // Recharger les tirages quand l'onglet actif change
    useEffect(() => {
        loadDraws(activeTab);
    }, [activeTab]);

    const loadDraws = async (status: AdminDrawStatus) => {
        setIsLoading(true);
        try {
// Ligne corrigée

const { items, total } = (await getAdminDrawsByStatus(status)) || { items: [], total: 0 };
            setDraws(items);
            setDrawsCount(prev => ({ ...prev, [status]: total }));
        } catch (error) {
            toast.error(`Impossible de charger les tirages "${status}".`);
            setDraws([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Rendu du composant ---
    return (
        <div className="p-4 md:p-8 space-y-8">
            <header>
                <h1 className="text-3xl font-bold">Gestion des Jeux</h1>
                <p className="text-muted-foreground mt-1">Créez des tirages, saisissez les résultats et consultez les archives</p>
            </header>
            
            <div className="flex justify-end">
                 <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />Nouveau Tirage
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminDrawStatus)}>
                <TabsList className="grid w-full max-w-lg grid-cols-3">
                    <TabsTrigger value="upcoming">À Venir ({drawsCount.upcoming})</TabsTrigger>
                    <TabsTrigger value="completed">Résultats ({drawsCount.completed})</TabsTrigger>
                    <TabsTrigger value="archived">Archives ({drawsCount.archived})</TabsTrigger>
                </TabsList>

                {['upcoming', 'completed', 'archived'].map(status => (
                    <TabsContent key={status} value={status}>
                        {isLoading ? (
                            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
                        ) : draws.length === 0 ? (
                           <EmptyState status={status as AdminDrawStatus} onCreateClick={() => setCreateModalOpen(true)} />
                        ) : (
                            <div className="grid gap-4 mt-6">
                                {draws.map((draw) => (
                                    <DrawCard key={draw.id} draw={draw} onEnterResults={() => {setSelectedDraw(draw); setResultsModalOpen(true);}} onArchive={() => {}} onCancel={() => {}} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
            
            {/* --- MODALES --- */}
            <CreateDrawModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)} 
                onSuccess={() => loadDraws(activeTab)}
            />
            {selectedDraw && (
                <ResultsModal
                    isOpen={isResultsModalOpen}
                    onClose={() => setResultsModalOpen(false)}
                    draw={selectedDraw}
                    onSuccess={() => loadDraws(activeTab)}
                />
            )}
        </div>
    );
}


// --- SOUS-COMPOSANTS POUR LA CLARTÉ ---

// Affiche la carte pour un tirage individuel
function DrawCard({ draw, onEnterResults }: { draw: Draw; onEnterResults: () => void; onArchive: () => void; onCancel: () => void; }) {
    const operator = OPERATORS_CONFIG.find(op => op.name === draw.operatorName);
    const drawDate = new Date(draw.drawDate);
    const formattedDate = !isNaN(drawDate.getTime()) ? drawDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Date invalide";
    const formattedTime = !isNaN(drawDate.getTime()) ? drawDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "";

    return (
      <Card className="p-4 md:p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-start gap-4">
                <span className="text-3xl pt-1">{operator?.icon || '🎲'}</span>
                <div>
                    <h3 className="font-bold text-lg">{draw.operatorName || 'Inconnu'}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>{formattedDate}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>{formattedTime}</span></div>
                    </div>
                    {draw.winningNumbers && draw.winningNumbers.length > 0 && 
                        <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold text-primary">
                           <Trophy className="h-4 w-4 text-yellow-400" /> Numéros: {draw.winningNumbers.join(', ')}
                        </div>
                    }
                </div>
            </div>
            {draw.status === 'upcoming' && !draw.winningNumbers && (
                <Button size="sm" variant="outline" onClick={onEnterResults}>
                    Saisir les Résultats
                </Button>
            )}
        </div>
      </Card>
    );
}

// Affiche l'état vide quand il n'y a pas de tirages
function EmptyState({ status, onCreateClick }: { status: AdminDrawStatus; onCreateClick: () => void; }) {
    const messages = {
        upcoming: { icon: Calendar, text: "Aucun tirage à venir" },
        completed: { icon: Trophy, text: "Aucun résultat à afficher" },
        archived: { icon: Archive, text: "Aucune archive trouvée" },
    };
    const { icon: Icon, text } = messages[status];

    return (
        <Card className="p-12 text-center text-muted-foreground border-dashed flex flex-col items-center justify-center">
            <Icon className="h-12 w-12 mb-4" />
            <p className="mb-6 font-semibold">{text}</p>
            {status === 'upcoming' && <Button onClick={onCreateClick}>Créer un tirage</Button>}
        </Card>
    );
}

// Gère la modale de création
function CreateDrawModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newDraw, setNewDraw] = useState({ operatorId: "", date: "", time: "" });
    const [multipliers, setMultipliers] = useState<Multipliers>(getDefaultMultipliers());

    const handleCreate = async () => {
        if (!newDraw.operatorId || !newDraw.date || !newDraw.time) {
            return toast.error("Veuillez remplir tous les champs obligatoires.");
        }
        setIsSubmitting(true);
        try {
            await createAdminDraw({ ...newDraw, multipliers });
            toast.success("Tirage créé avec succès !");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Erreur lors de la création du tirage.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Rendu de la modale de création...
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Créer un Nouveau Tirage</DialogTitle>
                    <DialogDescription>Sélectionnez l'opérateur, la date/heure et configurez les multiplicateurs.</DialogDescription>
                </DialogHeader>

                {/* --- CORRECTION : LE FORMULAIRE A ÉTÉ RÉINTÉGRÉ ICI --- */}
                <div className="py-4 space-y-6 overflow-y-auto pr-6">
                    <div className="space-y-2">
                        <Label>Opérateur *</Label>
                        <Select value={newDraw.operatorId} onValueChange={(v) => setNewDraw({...newDraw, operatorId: v})}>
                            <SelectTrigger><SelectValue placeholder="Choisir un opérateur..." /></SelectTrigger>
                            <SelectContent>{OPERATORS_CONFIG.map(op => <SelectItem key={op.id} value={op.id}><div className="flex items-center gap-2"><span>{op.icon}</span><span>{op.name} ({op.country})</span></div></SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><Label>Date du tirage *</Label><Input type="date" value={newDraw.date} onChange={(e) => setNewDraw({...newDraw, date: e.target.value})} /></div>
                        <div><Label>Heure du tirage *</Label><Input type="time" value={newDraw.time} onChange={(e) => setNewDraw({...newDraw, time: e.target.value})} /></div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <div className="flex items-center gap-2"><Info className="h-4 w-4 text-yellow-400" /><Label className="text-base">Multiplicateurs de Gains</Label></div>
                        <p className="text-xs text-muted-foreground">Configurez les multiplicateurs pour chaque type de pari. Le gain = Mise × Multiplicateur.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            {Object.keys(BET_TYPES_CONFIG).map(key => {const config = BET_TYPES_CONFIG[key]; return (<div key={key}><Label htmlFor={key} className="text-sm font-medium">{config.name} <span className="text-xs text-muted-foreground">({config.label})</span></Label><div className="flex items-center gap-2 mt-1"><Input id={key} type="number" value={multipliers[key] || ''} onChange={(e) => setMultipliers({...multipliers, [key]: Number(e.target.value)})}/><span className="text-sm text-muted-foreground">×</span></div></div>);})}
                        </div>
                    </div>
                </div>
                
                <DialogFooter className="pt-4 border-t mt-auto">
                    <Button variant="ghost" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleCreate} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Créer le Tirage
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Gère la modale de saisie des résultats
function ResultsModal({ isOpen, onClose, onSuccess, draw }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; draw: Draw; }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [winningNumbers, setWinningNumbers] = useState("");

    const handleSave = async () => {
        const numbersArray = winningNumbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (numbersArray.length < 5) {
            return toast.error("Veuillez saisir au moins 5 numéros valides.");
        }
        setIsSubmitting(true);
        try {
            await publishDrawResults(draw.id, numbersArray);
            toast.success("Résultats publiés et gains distribués !");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Erreur lors de la publication des résultats.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Saisir les Résultats pour {draw.operatorName}</DialogTitle>
                    <DialogDescription>Entrez les 5 numéros gagnants séparés par une virgule.</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="winning-numbers">Numéros Gagnants *</Label>
                    <Input id="winning-numbers" placeholder="ex: 5, 12, 23, 45, 67" value={winningNumbers} onChange={(e) => setWinningNumbers(e.target.value)} />
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Enregistrer et Payer les Gains
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}