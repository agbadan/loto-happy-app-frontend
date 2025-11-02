// src/components/BetCard.tsx

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Ticket } from '../utils/ticketsAPI';
import { BET_TYPES_CONFIG } from '../utils/games';
import { Calendar, Clock, Tag, Trophy, TrendingDown, CheckCircle, XCircle } from 'lucide-react';

interface BetCardProps {
  ticket: Ticket;
}

const statusConfig = {
  PENDING: { text: 'À venir', color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30', Icon: Clock },
  WON: { text: 'Gagné', color: 'bg-green-500/20 text-green-500 border-green-500/30', Icon: Trophy },
  LOST: { text: 'Perdu', color: 'bg-red-500/20 text-red-500 border-red-500/30', Icon: XCircle },
};

export function BetCard({ ticket }: BetCardProps) {
  const config = statusConfig[ticket.status];
  const betTypeFriendlyName = BET_TYPES_CONFIG[ticket.betType as keyof typeof BET_TYPES_CONFIG]?.name || ticket.betType;

  const userNumbers = ticket.numbers.split(',').map(n => n.trim());
  const winningNumbers = ticket.draw.winningNumbers?.split(',').map(n => n.trim()) || [];

  return (
    <Card className="p-4 space-y-4 transition-all hover:shadow-lg hover:border-primary/50">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-foreground">Pari {betTypeFriendlyName}</h3>
          <p className="text-xs text-muted-foreground">
            {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Badge className={`${config.color} gap-1.5`}>
          <config.Icon className="h-3.5 w-3.5" />
          <span>{config.text}</span>
        </Badge>
      </div>

      <div>
        <p className="text-sm font-medium mb-2 text-muted-foreground">Vos numéros</p>
        <div className="flex flex-wrap gap-2">
          {userNumbers.map((num) => (
            <span key={num} className={`flex items-center justify-center font-bold text-sm rounded-full w-8 h-8 ${
              winningNumbers.includes(num)
                ? 'bg-yellow-500 text-black ring-2 ring-offset-2 ring-offset-card ring-yellow-500' // Numéro gagnant
                : 'bg-muted text-foreground'
            }`}>
              {num}
            </span>
          ))}
        </div>
      </div>

      {winningNumbers.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Numéros gagnants du tirage</p>
          <div className="flex flex-wrap gap-2">
            {winningNumbers.map((num) => (
              <span key={num} className="flex items-center justify-center font-semibold text-xs rounded-full w-7 h-7 bg-card border">
                {num}
              </span>
            ))}
          </div>
        </div>
      )}

      {ticket.status === 'WON' && ticket.winnings && (
        <div className="p-3 rounded-lg bg-green-500/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-green-500">Gain</span>
            </div>
            <span className="font-bold text-lg text-green-500">+{ticket.winnings.toLocaleString('fr-FR')} F</span>
        </div>
      )}

      <div className="border-t border-border pt-3 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{new Date(`${ticket.draw.date}T00:00:00Z`).toLocaleDateString('fr-FR')} à {ticket.draw.time}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Tag className="h-4 w-4" />
          <span>Mise : <span className="font-semibold text-foreground">{ticket.betAmount.toLocaleString('fr-FR')} F</span></span>
        </div>
      </div>
    </Card>
  );
}