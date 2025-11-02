// src/components/BetHistory.tsx

import { useState, useEffect } from 'react';
import { getPlayerTickets, Ticket } from '../utils/ticketsAPI';
import { BetCard } from './BetCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type FilterType = 'ALL' | 'PENDING' | 'WON' | 'LOST';

// Correction pour s'assurer que 'En attente' n'apparaît pas en double
const filters: { label: string; value: FilterType }[] = [
    { label: 'Tous', value: 'ALL' },
    { label: 'À venir', value: 'PENDING' },
    { label: 'Gagnés', value: 'WON' },
    { label: 'Perdus', value: 'LOST' },
];

export function BetHistory() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      // --- LOG DE DÉBUT ---
      console.log('[DEBUG] BetHistory.tsx: Le composant se monte, déclenchement de fetchTickets...');
      
      try {
        setLoading(true);
        setError(null);
        const data = await getPlayerTickets();
        
        // --- LOG DE RÉUSSITE ---
        console.log('[DEBUG] BetHistory.tsx: Données reçues avec succès depuis getPlayerTickets:', data);
        
        setTickets(data);
      } catch (err) {
        // --- LOG D'ERREUR ---
        console.error('[ERREUR] BetHistory.tsx: Une erreur a été attrapée dans le composant.', err);
        setError("Impossible de charger l'historique des paris.");
        // Le toast est utile, mais on peut le commenter si ça devient bruyant
        // toast.error("Une erreur est survenue lors du chargement de vos paris.");
      } finally {
        setLoading(false);
        // --- LOG DE FIN ---
        console.log('[DEBUG] BetHistory.tsx: fetchTickets terminé. Nouvel état -> loading: false.');
      }
    };
    fetchTickets();
  }, []); // Le tableau vide signifie que cet effet ne s'exécute qu'une seule fois

  const filteredTickets = activeFilter === 'ALL'
    ? tickets
    : tickets.filter(ticket => ticket.status === activeFilter);

  // --- LOG DE RENDU ---
  // Ce log s'affichera à chaque fois que le composant est redessiné
  console.log(`[DEBUG] BetHistory.tsx: Rendu du composant. État actuel -> Loading: ${loading}, Error: ${error}, Nb de tickets: ${tickets.length}, Filtre: ${activeFilter}`);

  if (loading) {
    // --- LOG D'AFFICHAGE ---
    console.log('[DEBUG] BetHistory.tsx: Affichage du Loader...');
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    // --- LOG D'AFFICHAGE ---
    console.log('[DEBUG] BetHistory.tsx: Affichage du message d\'erreur.');
    return (
      <Card className="border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive font-semibold">{error}</p>
      </Card>
    );
  }

  // Calcul des statistiques après les vérifications de chargement et d'erreur
  const totalBets = tickets.length;
  const totalStaked = tickets.reduce((sum, ticket) => sum + ticket.betAmount, 0);
  const totalWon = tickets.reduce((sum, ticket) => sum + (ticket.winnings || 0), 0);
  const winningBetsCount = tickets.filter(ticket => ticket.status === 'WON').length;

  return (
    <div className="space-y-6">
      <div className="flex space-x-2">
        {filters.map(filter => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'brand' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter.value)}
            className="whitespace-nowrap"
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3"><p className="text-xs text-muted-foreground mb-1">Total Paris</p><p className="text-xl font-bold">{totalBets}</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground mb-1">Total Misé</p><p className="text-xl font-bold">{totalStaked.toLocaleString('fr-FR')} F</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground mb-1">Total Gagné</p><p className="text-xl font-bold text-green-500">{totalWon.toLocaleString('fr-FR')} F</p></Card>
        <Card className="p-3"><p className="text-xs text-muted-foreground mb-1">Paris Gagnants</p><p className="text-xl font-bold text-yellow-500">{winningBetsCount}</p></Card>
      </div>

      {tickets.length === 0 ? (
         <Card className="p-8 text-center"><p className="text-muted-foreground">Vous n'avez encore placé aucun pari.</p></Card>
      ) : filteredTickets.length > 0 ? (
        <div className="space-y-4">
          {filteredTickets.map(ticket => (
            <BetCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center"><p className="text-muted-foreground">Aucun pari dans cette catégorie.</p></Card>
      )}
    </div>
  );
}