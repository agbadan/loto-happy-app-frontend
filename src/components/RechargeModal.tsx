import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { Users } from "lucide-react";

interface RechargeModalProps {
  open: boolean;
  onClose: () => void;
  balance: number;
  onNavigateToResellers?: (amount: number) => void;
}

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

export function RechargeModal({ open, onClose, balance = 0, onNavigateToResellers }: RechargeModalProps) {
  const [amount, setAmount] = useState("");

  const handleFindReseller = () => {
    if (!amount || parseInt(amount) < 500) {
      toast.error("Le montant minimum est de 500 F CFA");
      return;
    }

    const rechargeAmount = parseInt(amount);
    
    // Naviguer vers l'écran des revendeurs avec le montant
    if (onNavigateToResellers) {
      onNavigateToResellers(rechargeAmount);
      onClose();
      setAmount("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recharger mon compte</DialogTitle>
          <DialogDescription>
            Indiquez le montant que vous souhaitez recharger
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Affichage du solde actuel */}
          <div className="rounded-lg border border-[#FFD700] bg-[#FFD700]/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Solde de Jeu actuel</p>
            <p className="text-2xl font-bold text-[#FFD700]">
              {balance.toLocaleString('fr-FR')} F CFA
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Montant à recharger (F CFA)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Entrez le montant"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-input-background border-input focus:border-[#FFD700]"
            />
          </div>

          {/* Quick Amounts */}
          <div className="space-y-2">
            <Label>Montants rapides</Label>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  className="border-border hover:border-[#FFD700] hover:bg-[#FFD700]/10"
                  onClick={() => setAmount(amt.toString())}
                >
                  {amt.toLocaleString('fr-FR')}
                </Button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            💡 Vous serez redirigé vers nos revendeurs agréés pour finaliser votre rechargement via Mobile Money
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
            onClick={handleFindReseller}
          >
            <Users className="mr-2 h-4 w-4" />
            Trouver un revendeur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}