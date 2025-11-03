// src/components/admin/AdminGames.tsx

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
import { toast } from "sonner";
import { Plus, Eye, Calendar, Trophy, Clock, Info, Loader2, Archive, Timer } from "lucide-react";
import { Draw, Multipliers, getAdminDrawsByStatus, createAdminDraw, publishDrawResults, getDrawReport, DrawReport } from "../../utils/drawsAPI";
import { OPERATORS_CONFIG as LOCAL_OPERATORS_CONFIG } from "../../utils/games";

const BET_TYPES_CONFIG: Record<string, { name: string; label: string }> = {
    'NAP1': { name: 'NAP 1', label: 'NAP1' }, 'NAP2': { name: 'NAP 2', label: 'NAP2 / Two Sure' },
    'NAP3': { name: 'NAP 3', label: 'NAP3' }, 'NAP4': { name: 'NAP 4', label: 'NAP4' },
    'NAP5': { name: 'NAP 5', label: 'NAP5 / Perm Nap' }, 'PERMUTATION': { name: 'Permutation', label: 'Permutation' },
    'BANKA': { name: 'Banka', label: 'Against / Banka' }, 'CHANCE_PLUS': { name: 'Chance+', label: 'Chance+' },
    'ANAGRAMME': { name: 'Anagramme', label: 'Anagramme / WE dans WE' },
};

const getDefaultMultipliers = (): Multipliers => ({
    NAP1: 240, NAP2: 500, NAP3: 2500, NAP4: 10000, NAP5: 50000,
    PERMUTATION: 240, BANKA: 400, CHANCE_PLUS: 90, ANAGRAMME: 10,
});

type AdminDrawStatus = 'upcoming' | 'pending' | 'archived' | 'cancelled';

export function AdminGames() {
    const [activeTab, setActiveTab] = useState<AdminDrawStatus>('upcoming');
    const [isLoading, setIsLoading] = useState(true);
    const [drawsByStatus, setDrawsByStatus] = useState<Record<AdminDrawStatus, Draw[]>>({ upcoming: [], pending: [], archived: [], cancelled: [] });
    const [error, setError] = useState<Record<AdminDrawStatus, string | null>>({ upcoming: null, pending: null, archived: null, cancelled: null });
    
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isResultsModalOpen, setResultsModalOpen] = useState(false);
    const [isReportView, setReportView] = useState(false);
    const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);

    const loadDraws = async (status: AdminDrawStatus) => {
        setIsLoading(true);
        setError(prev => ({ ...prev, [status]: null }));
        try {
            const items = await getAdminDrawsByStatus(status);
            setDrawsByStatus(prev => ({ ...prev, [status]: items }));
        } catch (err) {
            setError(prev => ({ ...prev, [status]: `Impossible de charger les tirages "${status}".` }));
            setDrawsByStatus(prev => ({ ...prev, [status]: [] }));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDraws(activeTab);
    }, [activeTab]);

    if (isReportView && selectedDraw) {
        return <DrawReportView draw={selectedDraw} onBack={() => { setReportView(false); setSelectedDraw(null); }} />;
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
        <div className="p-4 md:p-8 space-y-8">
            {/* --- DÉBUT DE LA CORRECTION RESPONSIVE --- */}
            
            {/* Conteneur principal pour le header de la page */}
            <div className="space-y-4">
                
                {/* Ligne 1 : Titre et Bouton, qui s'empilent sur mobile */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Gestion des Tirages</h1>
                        <p className="text-muted-foreground mt-1">Créez des tirages, saisissez les résultats et consultez les archives</p>
                    </div>
                    <Button 
                        onClick={() => setCreateModalOpen(true)} 
                        className="bg-yellow-400 text-black hover:bg-yellow-500 w-full sm:w-auto flex-shrink-0"
                    >
                        <Plus className="mr-2 h-4 w-4" />Nouveau Tirage
                    </Button>
                </div>
                
                {/* Ligne 2 : Barre d'onglets */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminDrawStatus)}>
                    <div className="w-full overflow-x-auto">
                        <TabsList className="inline-flex w-auto min-w-full sm:w-full sm:max-w-lg bg-muted">
                            <TabsTrigger value="upcoming" className="flex-1 min-w-[140px] gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>À Venir</span>
                                <Badge>{drawsByStatus.upcoming.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="pending" className="flex-1 min-w-[140px] gap-2">
                                <Timer className="h-4 w-4" />
                                <span>Résultats</span>
                                <Badge>{drawsByStatus.pending.length}</Badge>
                            </TabsTrigger>
                            <TabsTrigger value="archived" className="flex-1 min-w-[140px] gap-2">
                                <Trophy className="h-4 w-4" />
                                <span>Archives</span>
                                <Badge>{drawsByStatus.archived.length}</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </Tabs>
            </div>

    <TabsContent value={activeTab} className="mt-6">
        {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/></div>
        ) : error[activeTab] ? (
            <ErrorState message={error[activeTab]!} />
        ) : drawsByStatus[activeTab].length === 0 ? (
           <EmptyState status={activeTab} onCreateClick={() => setCreateModalOpen(true)} />
        ) : (
            <div className="grid gap-4">
                {drawsByStatus[activeTab].map((draw) => (
                    <DrawCard key={draw.id} draw={draw} onEnterResults={() => {setSelectedDraw(draw); setResultsModalOpen(true);}} onViewReport={() => {setSelectedDraw(draw); setReportView(true);}} />
                ))}
            </div>
        )}
    </TabsContent>
</Tabs>
            
            <CreateDrawModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setCreateModalOpen(false)} 
                onSuccess={() => {
                    if (activeTab === 'upcoming') { loadDraws('upcoming'); } 
                    else { setActiveTab('upcoming'); }
                }}
            />
            {selectedDraw && (
                <ResultsModal
                    isOpen={isResultsModalOpen}
                    onClose={() => setResultsModalOpen(false)}
                    draw={selectedDraw}
                    onSuccess={() => setActiveTab('archived')}
                />
            )}
        </div>
    );
}

// --- SOUS-COMPOSANTS ---



function DrawCard({ draw, onEnterResults, onViewReport }: { draw: Draw; onEnterResults: () => void; onViewReport: () => void; }) {
    const drawDate = new Date(draw.drawDate);
    const formattedDate = !isNaN(drawDate.getTime()) ? drawDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : "Date invalide";
    const formattedTime = !isNaN(drawDate.getTime()) ? drawDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "";

    return (
      <Card className="p-4 md:p-6">
        {/* --- DÉBUT DE LA CORRECTION RESPONSIVE --- */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            
            {/* Section Gauche : Infos du tirage */}
            <div className="flex items-start gap-4">
                <span className="text-xl font-bold text-muted-foreground pt-1 w-10 text-center">
                  {draw.operatorIcon || '🎲'}
                </span>
                <div>
                    <h3 className="font-bold text-lg">{draw.operatorName}</h3>
                    <div className="mt-2 flex flex-col xs:flex-row items-start xs:items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /><span>{formattedDate}</span></div>
                        <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><span>{formattedTime}</span></div>
                    </div>
                    
                    {draw.status === 'upcoming' && (
                        <p className="text-xs text-muted-foreground mt-2">{draw.participants} participant(s)</p>
                    )}

                    {draw.status === 'archived' && (
                        <div className="mt-3 space-y-2">
                            <p className="flex items-center gap-1.5 text-sm font-semibold text-yellow-400">
                                <Trophy className="h-4 w-4" /> Numéros: {draw.winningNumbers?.join(', ') || 'N/A'}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>{draw.participants ?? 0} participants</span>
                                <span className="text-green-500">{draw.winners ?? 0} gagnant(s)</span>
                                <span>Profit: 
                                  <span className={(draw.profit ?? 0) >= 0 ? 'text-green-500' : 'text-red-500'}>
                                      {' '}{(draw.profit ?? 0).toLocaleString('fr-FR')} F
                                  </span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Section Droite : Boutons d'action */}
            <div className="w-full sm:w-auto flex-shrink-0">
                {draw.status === 'pending' && (
                  <Button size="sm" onClick={onEnterResults} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
                      Saisir les Résultats
                  </Button>
                )}
                {draw.status === 'archived' && (
                  <Button size="sm" variant="outline" onClick={onViewReport} className="w-full sm:w-auto">
                      <Eye className="h-4 w-4 mr-2" />Voir Rapport
                  </Button>
                )}
            </div>
        </div>
        {/* --- FIN DE LA CORRECTION RESPONSIVE --- */}
      </Card>
    );
}


function ErrorState({ message }: { message: string }) {
    return (
        <Card className="p-12 text-center text-red-500 border-red-500/20 bg-red-500/5 flex flex-col items-center justify-center">
            <Info className="h-12 w-12 mb-4" />
            <p className="font-semibold">{message}</p>
        </Card>
    );
}
// Le reste des sous-composants (EmptyState, CreateDrawModal, ResultsModal) reste identique au code que je vous ai fourni précédemment.
// Je les inclus ici pour que le fichier soit complet.

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
        // La config locale est suffisante, pas besoin d'appel API
        setOperators(LOCAL_OPERATORS_CONFIG.map(op => ({
            id: op.id,
            name: op.name,
            icon: op.icon,
            country: op.country
        })));
    }, [isOpen]);

    const handleCreate = async () => {
        if (!newDraw.operatorId || !newDraw.date || !newDraw.time) { return toast.error("Veuillez remplir tous les champs obligatoires."); }
        setIsSubmitting(true);
        try {
            await createAdminDraw({ ...newDraw, multipliers });
            toast.success("Tirage créé avec succès !");
            onSuccess();
            onClose();
        } catch (error) { toast.error("Erreur lors de la création du tirage."); } 
        finally { setIsSubmitting(false); }
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
                    <Button onClick={handleCreate} disabled={isSubmitting} className="bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90">
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
        if (numbersArray.length !== 5) { return toast.error("Veuillez saisir exactement 5 numéros valides."); }
        setIsSubmitting(true);
        try {
            await publishDrawResults(draw.id, numbersArray);
            toast.success("Résultats publiés et gains distribués !");
            onSuccess();
            onClose();
        } catch (error) { toast.error("Erreur lors de la publication des résultats."); } 
        finally { setIsSubmitting(false); }
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

// NOUVEAU : Composant pour la vue de rapport
function DrawReportView({ draw, onBack }: { draw: Draw; onBack: () => void; }) {
    const [report, setReport] = useState<DrawReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoading(true);
            try {
                const data = await getDrawReport(draw.id);
                setReport(data);
            } catch (error) {
                toast.error("Impossible de charger le rapport du tirage.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [draw.id]);

    if (isLoading) {
        return <div className="p-8 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!report) {
        return (
            <div className="p-8">
                <Button variant="ghost" onClick={onBack} className="mb-2">← Retour</Button>
                <ErrorState message="Le rapport pour ce tirage n'a pas pu être chargé." />
            </div>
        );
    }
    
    const { stats, tickets } = report;
    const winners = tickets.filter(t => t.status === 'won');

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
            <div>
                <Button variant="ghost" onClick={onBack} className="mb-2">← Retour aux archives</Button>
                <h1 className="text-3xl font-bold">Rapport de Tirage</h1>
                <p className="text-muted-foreground">{draw.operatorName} - {new Date(draw.drawDate).toLocaleDateString('fr-FR')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6"><p className="text-sm text-muted-foreground">Total Mises</p><p className="text-xl font-bold">{stats.total_bets.toLocaleString('fr-FR')} F</p></Card>
                <Card className="p-6"><p className="text-sm text-muted-foreground">Total Gains</p><p className="text-xl font-bold text-orange-400">{stats.total_winnings.toLocaleString('fr-FR')} F</p></Card>
                <Card className="p-6"><p className="text-sm text-muted-foreground">Bénéfice</p><p className={`text-xl font-bold ${stats.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>{stats.profit.toLocaleString('fr-FR')} F</p></Card>
                <Card className="p-6"><p className="text-sm text-muted-foreground">Gagnants</p><p className="text-xl font-bold">{stats.winners} / {stats.participants}</p></Card>
            </div>
            <Card>
                <div className="p-6"><h3 className="text-lg font-bold">Liste des Gagnants ({winners.length})</h3></div>
                {winners.length > 0 && <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Pari</TableHead><TableHead>Numéros</TableHead><TableHead>Mise</TableHead><TableHead className="text-right">Gain</TableHead></TableRow></TableHeader><TableBody>{winners.map(t => (<TableRow key={t.id}><TableCell>{t.username}</TableCell><TableCell>{t.betType}</TableCell><TableCell>{t.numbers}</TableCell><TableCell>{t.betAmount.toLocaleString('fr-FR')} F</TableCell><TableCell className="text-right text-green-500 font-bold">{t.winAmount?.toLocaleString('fr-FR')} F</TableCell></TableRow>))}</TableBody></Table></div>}
            </Card>
        </div>
    );
}