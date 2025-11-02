// src/components/BetCard.tsx

import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Ticket } from '../utils/ticketsAPI';
import { BET_TYPES_CONFIG } from '../utils/games';
import { Calendar, Clock, Trophy, XCircle } from 'lucide-react';

interface BetCardProps {
  ticket: Ticket;
}

const statusConfig = {
  PENDING: { text: 'À venir', color: '#FFD700', textColor: '#121212', Icon: Clock },
  WON: { text: 'Gagné', color: '#34C759', textColor: '#FFFFFF', Icon: Trophy },
  LOST: { text: 'Perdu', color: '#8e8e93', textColor: '#FFFFFF', Icon: XCircle },
};

export function BetCard({ ticket }: BetCardProps) {
  const config = statusConfig[ticket.status];
  const betTypeFriendlyName = BET_TYPES_CONFIG[ticket.betType as keyof typeof BET_TYPES_CONFIG]?.name || ticket.betType;

  const userNumbers = ticket.numbers.split(',').map(n => n.trim());
  const winningNumbers = ticket.draw.winningNumbers?.split(',').map(n => n.trim()) || [];

  return (
    <Card className="overflow-hidden border-border bg-card">
      <div className="p-4 text-white" style={{ backgroundColor: config.color }}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg" style={{ color: config.textColor }}>
            Pari du {new Date(ticket.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </h3>
          <Badge variant="outline" className="bg-white/20 border-white/50" style={{ color: config.textColor }}>
            <config.Icon className="h-4 w-4 mr-1.5" />
            {config.text}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <p className="text-sm font-medium mb-2 text-muted-foreground">Vos numéros ({betTypeFriendlyName})</p>
          <div className="flex flex-wrap gap-2">
            {userNumbers.map((num) => (
              <span key={num} className={`flex items-center justify-center font-bold text-sm rounded-lg w-10 h-10 ${
                winningNumbers.includes(num)
                  ? 'bg-yellow-500 text-black ring-2 ring-offset-2 ring-offset-card ring-yellow-500'
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
            <div className="flex flex-wrap gap-1.5">
              {winningNumbers.map((num) => (
                <span key={num} className="flex items-center justify-center font-semibold text-xs rounded-full w-7 h-7 bg-card border">
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}

        <Separator />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(`${ticket.draw.date}T00:00:00Z`).toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{ticket.draw.time}</span>
            </div>
             <div className="col-span-2 flex items-center gap-2 text-muted-foreground">
                <span>Mise : <span className="font-semibold text-foreground">{ticket.betAmount.toLocaleString('fr-FR')} F</span></span>
                {ticket.status === 'WON' && ticket.winnings && (
                    <span className="ml-auto font-bold text-lg text-green-500">
                        Gain : +{ticket.winnings.toLocaleString('fr-FR')} F
                    </span>
                )}
            </div>
        </div>
      </div>
    </Card>
  );
}