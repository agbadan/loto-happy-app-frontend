import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface GoogleAccount {
  email: string;
  name: string;
  avatar: string;
}

// Comptes Google de test pour simulation
const GOOGLE_TEST_ACCOUNTS: GoogleAccount[] = [
  {
    email: "joueur.test@gmail.com",
    name: "Joueur Test",
    avatar: "🎮",
  },
  {
    email: "marie.dupont@gmail.com",
    name: "Marie Dupont",
    avatar: "👩",
  },
  {
    email: "nouveau.joueur@gmail.com",
    name: "Nouveau Joueur",
    avatar: "🆕",
  },
];

interface GoogleAuthModalProps {
  open: boolean;
  onClose: () => void;
  onSelectAccount: (email: string, name: string) => void;
}

export function GoogleAuthModal({ open, onClose, onSelectAccount }: GoogleAuthModalProps) {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const handleSelectAccount = (account: GoogleAccount) => {
    setSelectedEmail(account.email);
    // Animation de sélection puis appel
    setTimeout(() => {
      onSelectAccount(account.email, account.name);
      setSelectedEmail(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-border bg-card">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <DialogTitle className="text-xl">Choisir un compte</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Sélectionnez un compte Google pour vous connecter ou vous inscrire à Lotto Happy
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-2">
          <p className="text-sm text-muted-foreground mb-4">
            Pour continuer vers <span className="font-semibold text-foreground">Lotto Happy</span>
          </p>

          <AnimatePresence>
            {GOOGLE_TEST_ACCOUNTS.map((account) => (
              <motion.button
                key={account.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectAccount(account)}
                className={`
                  w-full flex items-center gap-4 p-4 rounded-xl border-2 
                  transition-all duration-200
                  ${
                    selectedEmail === account.email
                      ? "border-[#4285F4] bg-[#4285F4]/10"
                      : "border-border bg-muted/30 hover:border-[#4285F4]/50 hover:bg-muted/50"
                  }
                `}
              >
                {/* Avatar */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#4285F4] to-[#34A853] text-2xl">
                  {account.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <p className="font-semibold text-foreground">{account.name}</p>
                  <p className="text-sm text-muted-foreground">{account.email}</p>
                </div>

                {/* Loading indicator quand sélectionné */}
                {selectedEmail === account.email && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-6 w-6 rounded-full border-2 border-[#4285F4] border-t-transparent animate-spin"
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>

          {/* Divider */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-4 text-xs text-muted-foreground">
                Comptes de test pour démo
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="rounded-lg border border-[#4285F4]/30 bg-[#4285F4]/5 p-3">
            <p className="text-xs text-muted-foreground">
              💡 <strong className="text-foreground">Comment tester :</strong>
              <br />
              • <strong>joueur.test@gmail.com</strong> : Compte existant (connexion directe)
              <br />
              • <strong>nouveau.joueur@gmail.com</strong> : Nouveau compte (inscription)
              <br />
              • <strong>marie.dupont@gmail.com</strong> : À créer manuellement pour tester
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}