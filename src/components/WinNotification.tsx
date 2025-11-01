import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PartyPopper, Gift } from 'lucide-react';
import { getMyTickets } from '../utils/dashboardAPI';
import { Ticket } from '../utils/drawsAPI'; // On importe le type Ticket
import { toast } from 'sonner';

const SEEN_WINS_STORAGE_KEY = 'lotoHappy_seenWins_v2';

export function WinNotificationPanel() {
  const [newWins, setNewWins] = useState<Ticket[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const checkWins = async () => {
      try {
        const tickets = await getMyTickets();
        const wonTickets = tickets.filter(t => t.status === 'won' && t.winAmount && t.winAmount > 0);

        if (wonTickets.length > 0) {
          const seenWins: string[] = JSON.parse(localStorage.getItem(SEEN_WINS_STORAGE_KEY) || '[]');
          const unreadWins = wonTickets.filter(t => !seenWins.includes(t.id));

          if (unreadWins.length > 0) {
            setNewWins(unreadWins);
            toast.success(`Félicitations ! Vous avez ${unreadWins.length} nouveau(x) gain(s) !`);
          }
        }
      } catch (error) {
        console.error("Failed to check for wins:", error);
      }
    };
    checkWins();
  }, []);

  const handleClose = () => {
    const seenWins: string[] = JSON.parse(localStorage.getItem(SEEN_WINS_STORAGE_KEY) || '[]');
    newWins.forEach(win => {
      if (!seenWins.includes(win.id)) {
        seenWins.push(win.id);
      }
    });
    localStorage.setItem(SEEN_WINS_STORAGE_KEY, JSON.stringify(seenWins));
    setNewWins([]);
    setCurrentIndex(0);
  };
  
  const handleNext = () => {
     if (currentIndex < newWins.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleClose();
    }
  }

  const currentWin = newWins[currentIndex];
  if (!currentWin) return null;

  return (
    <Dialog open={newWins.length > 0} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-0 p-8">
        <DialogHeader className="text-center mb-4">
            <div className="flex justify-center mb-4">
                <PartyPopper className="h-16 w-16 text-yellow-500" />
            </div>
            <DialogTitle className="text-2xl font-bold">Félicitations !</DialogTitle>
            <p className="text-muted-foreground">Tirage {currentWin.operatorName}</p>
        </DialogHeader>

        <Card className="p-6 text-center border-2 border-yellow-500 bg-yellow-500/10 mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">Vous avez gagné</span>
            </div>
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                {currentWin.winAmount?.toLocaleString('fr-FR')} F
            </div>
        </Card>

        <div className="text-sm text-center text-green-600 dark:text-green-400 mb-6">
            ✓ Ce montant a été crédité sur votre solde de gains.
        </div>

        {newWins.length > 1 && (
            <div className="text-center text-sm text-muted-foreground mb-4">
              Gain {currentIndex + 1} sur {newWins.length}
            </div>
        )}

        {currentIndex < newWins.length - 1 ? (
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleNext}>Suivant</Button>
        ) : (
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" onClick={handleClose}>Super !</Button>
        )}
      </DialogContent>
    </Dialog>
  );
}