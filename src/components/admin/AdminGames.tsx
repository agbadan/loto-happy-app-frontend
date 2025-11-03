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
import { Plus, Calendar, Trophy, Clock, Info, Loader2, Archive } from "lucide-react";

// MISE À JOUR : Import des fonctions API réelles
import { Draw, Multipliers, getAdminDrawsByStatus, createAdminDraw, publishDrawResults } from "../../utils/drawsAPI";
import { OPERATORS_CONFIG as LOCAL_OPERATORS_CONFIG } from "../../utils/games";// On utilise la config des opérateurs de l'API publique

// Définition des types de pari pour le formulaire
const BET_TYPES_CONFIG: Record<string, { name: string; label: string }> = {
    'NAP1': { name: 'NAP 1', label: 'NAP1' },
    'NAP2': { name: 'NAP 2', label: 'NAP2 / Two Sure' },
    'NAP3': { name: 'NAP 3', label: 'NAP3' },
    'NAP4': { name: 'NAP 4', label: 'NAP4' },
    'NAP5': { name: 'NAP 5', label: 'NAP5 / Perm Nap' },
    'PERMUTATION': { name: 'Permutation', label: 'Permutation' },
    'BANKA': { name: 'Banka', label: 'Against / Banka' },
    'CHANCE_PLUS': { name: 'Chance+', label: 'Chance+' },
    'ANAGRAMME': { name: 'Anagramme', label: 'Anagramme / WE dans WE' },
};

const getDefaultMultipliers = (): Multipliers => ({
    NAP1: 240, NAP2: 500, NAP3: 2500, NAP4: 10000, NAP5: 50000,
    PERMUTATION: 240, BANKA: 400, CHANCE_PLUS: 90, ANAGRAMME: 10,
});

// NOUVEAU : Le type de statut est aligné avec le backend
type AdminDrawStatus = 'upcoming' | 'pending' | 'archived' | 'cancelled';

export function AdminGames() {
    const [activeTab, setActiveTab] = useState<AdminDrawStatus>('upcoming');
    const [isLoading, setIsLoading] = useState(true);
    const [draws, setDraws] = useState<Draw[]>([]);
    
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isResultsModalOpen, setResultsModalOpen] = useState(false);
    const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);

    // NOUVEAU : Fonction de chargement qui utilise l'API
    const loadDraws = async (status: AdminDrawStatus) => {
        setIsLoading(true);
        try {
            const items = await getAdminDrawsByStatus(status);
            setDraws(items);
        } catch (error) {
            toast.error(`Impossible de charger les tirages "${status}".`);
            setDraws([]);
        } finally {
            setIsLoading(false);
        }
    };

    // NOUVEAU : L'effet se déclenche au changement d'onglet
    useEffect(() => {
        loadDraws(activeTab);
    }, [activeTab]);
    
    return (
        <div className="p-4 md:p-8 space-y-8">
            <header className="flex justify-between items-start flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Gestion des Jeux</h1>
                    <p className="text-muted-foreground mt-1">Créez des tirages, saisissez les résultats et consultez les archives</p>
                </div>
                <Button onClick={() => setCreateModalOpen(true)} className="bg-yellow-400 text-black hover:bg-yellow-500">
                    <Plus className="mr-2 h-4 w-4" />Nouveau Tirage
                </Button>
            </header>
            
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminDrawStatus)}>
                <TabsList className="grid w-full max-w-lg grid-cols-3">
                    <TabsTrigger value="upcoming">À Venir</TabsTrigger>
                    <TabsTrigger value="pending">Saisie Résultats</TabsTrigger>
                    <TabsTrigger value="archived">Archives</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-6">
                    {isLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
                    ) : draws.length === 0 ? (
                       <EmptyState status={activeTab} onCreateClick={() => setCreateModalOpen(true)} />
                    ) : (
                        <div className="grid gap-4">
                            {draws.map((draw) => (
                                <DrawCard key={draw.id} draw={draw} onEnterResults={() => {setSelectedDraw(draw); setResultsModalOpen(true);}} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
            
            <CreateDrawModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)} 
                onSuccess={() => {
                    // Si on est déjà sur l'onglet 'upcoming', on recharge. Sinon, on y va.
                    if (activeTab === 'upcoming') {
                        loadDraws('upcoming');
                    } else {
                        setActiveTab('upcoming');
                    }
                }}
            />
            {selectedDraw && (
                <ResultsModal
                    isOpen={isResultsModalOpen}
                    onClose={() => setResultsModalOpen(false)}
                    draw={selectedDraw}
                    onSuccess={() => {
                        // Après saisie, on va voir le résultat dans les archives
                        setActiveTab('archived');
                    }}
                />
            )}
        </div>
    );
}

// --- SOUS-COMPOSANTS (Légèrement modifiés) ---

function DrawCard({ draw, onEnterResults }: { draw: Draw; onEnterResults: () => void; }) {
    // La date est maintenant un string ISO, on la parse
    const drawDate = new Date(draw.drawDate);
    const formattedDate = !isNaN(drawDate.getTime()) ? drawDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Date invalide";
    const formattedTime = !isNaN(drawDate.getTime()) ? drawDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "";

    return (
      <Card className="p-4 md:p-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex items-start gap-4">
                <span className="text-3xl pt-1">🎲</span> {/* Icône statique car non fournie par l'API admin/draws */}
                <div>
                    <h3 className="font-bold text-lg">{draw.operatorName || 'Inconnu'}</h3>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>{formattedDate}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>{formattedTime}</span></div>
                    </div>
                    {draw.winningNumbers && draw.winningNumbers.length > 0 && 
                        <div className="flex items-center gap-1.5 mt-3 text-sm font-semibold text-yellow-400">
                           <Trophy className="h-4 w-4" /> Numéros: {draw.winningNumbers.join(', ')}
                        </div>
                    }
                </div>
            </div>
            {/* Le bouton s'affiche pour les tirages en statut 'pending' */}
            {draw.status === 'pending' && (
                <Button size="sm" onClick={onEnterResults} className="bg-orange-500 hover:bg-orange-600 text-white">
                    Saisir les Résultats
                </Button>
            )}
        </div>
      </Card>
    );
}

function EmptyState({ status, onCreateClick }: { status: AdminDrawStatus; onCreateClick: () => void; }) {
    const messages: Record<AdminDrawStatus, {icon: React.ElementType, text: string}> = {
        upcoming: { icon: Calendar, text: "Aucun tirage à venir" },
        pending: { icon: Trophy, text: "Aucun tirage en attente de résultat" },
        archived: { icon: Archive, text: "Aucune archive trouvée" },
        cancelled: { icon: Archive, text: "Aucun tirage annulé" }
    };
    const { icon: Icon, text } = messages[status];

    return (
        <Card className="p-12 text-center text-muted-foreground border-dashed flex flex-col items-center justify-center">
            <Icon className="h-12 w-12 mb-4" />
            <p className="mb-6 font-semibold">{text}</p>
            {status === 'upcoming' && <Button onClick={onCreateClick} className="bg-yellow-400 text-black hover:bg-yellow-500">Créer un tirage</Button>}
        </Card>
    );
}

function CreateDrawModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newDraw, setNewDraw] = useState({ operatorId: "", date: "", time: "" });
    const [multipliers, setMultipliers] = useState<Multipliers>(getDefaultMultipliers());
    const [operators, setOperators] = useState<{id: string, name: string, icon: string, country: string}[]>([]);

    useEffect(() => {
        const fetchOperators = async () => {
            try {
                // On utilise la liste d'opérateurs de l'API publique
                const ops = await OPERATORS_CONFIG;
                setOperators(ops);
            } catch (error) {
                toast.error("Impossible de charger les opérateurs.");
            }
        };
        if (isOpen) {
            fetchOperators();
        }
    }, [isOpen]);

    const handleCreate = async () => {
        if (!newDraw.operatorId || !newDraw.date || !newDraw.time) {
            return toast.error("Veuillez remplir tous les champs obligatoires.");
        }
        setIsSubmitting(true);
        try {
            // NOUVEAU : Appel à l'API réelle
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
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Créer un Nouveau Tirage</DialogTitle>
                    <DialogDescription>Sélectionnez l'opérateur, la date/heure et configurez les multiplicateurs.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6 overflow-y-auto pr-6">
                    <div className="space-y-2">
                        <Label>Opérateur *</Label>
                        <Select value={newDraw.operatorId} onValueChange={(v) => setNewDraw({...newDraw, operatorId: v})}>
                            <SelectTrigger><SelectValue placeholder="Choisir un opérateur..." /></SelectTrigger>
                            <SelectContent>{operators.map(op => <SelectItem key={op.id} value={op.id}><div className="flex items-center gap-2"><span>{op.icon}</span><span>{op.name} ({op.country})</span></div></SelectItem>)}</SelectContent>
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
                    <Button onClick={handleCreate} disabled={isSubmitting} className="bg-yellow-400 text-black hover:bg-yellow-500">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Créer le Tirage
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ResultsModal({ isOpen, onClose, onSuccess, draw }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; draw: Draw; }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [winningNumbers, setWinningNumbers] = useState("");

    const handleSave = async () => {
        const numbersArray = winningNumbers.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (numbersArray.length !== 5) { // Votre backend attend 5 numéros
            return toast.error("Veuillez saisir exactement 5 numéros valides.");
        }
        setIsSubmitting(true);
        try {
            // NOUVEAU : Appel à l'API réelle
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
                    <Button onClick={handleSave} disabled={isSubmitting} className="bg-yellow-400 text-black hover:bg-yellow-500">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}Enregistrer et Payer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}