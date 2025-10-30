import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner@2.0.3";
import { ArrowRightLeft } from "lucide-react";

interface ConvertModalProps {
  open: boolean;
  onClose: () => void;
  winningsBalance: number;
  onConvert: (amount: number) => boolean;
}

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

export function ConvertModal({ open, onClose, winningsBalance = 0, onConvert }: ConvertModalProps) {
  const [amount, setAmount] = useState("");

  const handleConvert = () => {
    const convertAmount = parseInt(amount);
    
    if (!amount || convertAmount <= 0) {
      toast.error("Veuillez entrer un montant valide");
      return;
    }
    
    if (convertAmount > winningsBalance) {
      toast.error("Montant supérieur à votre solde des gains");
      return;
    }

    const success = onConvert(convertAmount);
    
    if (success) {
      toast.success(`${convertAmount.toLocaleString('fr-FR')} F CFA transférés vers votre solde de jeu !`);
      onClose();
      setAmount("");
    } else {
      toast.error("Erreur lors de la conversion");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5 text-[#FFD700]" />
            Convertir mes gains
          </DialogTitle>
          <DialogDescription>
            Transférez vos gains vers votre solde de jeu pour continuer à jouer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Affichage du solde des gains */}
          <div className="rounded-lg border border-[#34C759] bg-[#34C759]/10 p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Solde des Gains disponible</p>
            <p className="text-2xl font-bold text-[#34C759]">
              {winningsBalance.toLocaleString('fr-FR')} F CFA
            </p>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="convert-amount">Montant à convertir (F CFA)</Label>
            <Input
              id="convert-amount"
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
                  disabled={amt > winningsBalance}
                  className="border-border hover:border-[#FFD700] hover:bg-[#FFD700]/10 disabled:opacity-50"
                  onClick={() => setAmount(amt.toString())}
                >
                  {amt.toLocaleString('fr-FR')}
                </Button>
              ))}
              <Button
                variant="outline"
                disabled={winningsBalance === 0}
                className="border-border hover:border-[#FFD700] hover:bg-[#FFD700]/10"
                onClick={() => setAmount(winningsBalance.toString())}
              >
                Tout
              </Button>
            </div>
          </div>

          {/* Information */}
          <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
            💡 Les gains convertis seront ajoutés à votre solde de jeu et pourront être utilisés pour vos prochains paris.
          </div>

          {/* Submit Button */}
          <Button
            className="w-full bg-[#FFD700] text-[#121212] hover:bg-[#FFD700]/90"
            onClick={handleConvert}
          >
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Convertir en solde de jeu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
