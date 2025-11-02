// src/components/BetHistory.tsx

import { useState, useEffect } from 'react';
import { getPlayerTickets, Ticket } from '../utils/ticketsAPI';
import { BetCard } from './BetCard';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type FilterType = 'ALL' | 'PENDING' | 'WON' | 'LOST';

const filters: { label: string; value: FilterType }[] = [
    { label: 'Tous', value: 'ALL' },
    { label: 'À venir', value: 'PENDING' },
    { label: 'En attente', value: 'PENDING' }, // Consolidé avec 'À venir'
    { label: 'Gagnés', value: 'WON' },
    { label: 'Perdus', value: 'LOST' },
].filter((v, i, a) => a.findIndex(t => (t.value === v.value)) === i); // Supprime les doublons


export function BetHistory() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getPlayerTickets();
        setTickets(data);
      } catch (err) {
        setError("Impossible de charger l'historique des paris.");
        toast.error("Une erreur est survenue lors du chargement de vos paris.");
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const filteredTickets = activeFilter === 'ALL'
    ? tickets
    : tickets.filter(ticket => ticket.status === activeFilter);

  const totalBets = tickets.length;
  const totalStaked = tickets.reduce((sum, ticket) => sum + ticket.betAmount, 0);
  const totalWon = tickets.reduce((sum, ticket) => sum + (ticket.winnings || 0), 0);
  const winningBetsCount = tickets.filter(ticket => ticket.status === 'WON').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50 bg-destructive/10 p-8 text-center">
        <p className="text-destructive font-semibold">{error}</p>
      </Card>
    );
  }

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