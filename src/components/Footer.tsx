import { AlertTriangle, Shield } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card/50">
      <div className="container px-4 py-12">
        {/* --- CORRECTION PRINCIPALE ICI --- */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Liens Utiles */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">
              Liens Utiles
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#FFD700] transition-colors"
                >
                  Comment jouer
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#FFD700] transition-colors"
                >
                  Résultats des tirages
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#FFD700] transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#FFD700] transition-colors"
                >
                  Support client
                </a>
              </li>
            </ul>
          </div>

          {/* Paiements Sécurisés */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">
              Paiements Sécurisés
            </h4>
            {/* --- AMÉLIORATION (PLUS ROBUSTE) ICI --- */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 items-center rounded-lg border border-border bg-background px-3">
                <span className="text-xs font-semibold text-[#FFD700]">
                  T-Money
                </span>
              </div>
              <div className="flex h-12 items-center rounded-lg border border-border bg-background px-3">
                <span className="text-xs font-semibold text-[#FF6B00]">
                  Flooz
                </span>
              </div>
              <div className="flex h-12 items-center rounded-lg border border-border bg-background px-3">
                <span className="text-xs font-semibold text-[#FF6B00]">
                  Orange
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-[#34C759]" />
              <span>Transactions 100% sécurisées</span>
            </div>
          </div>

          {/* Informations Légales */}
          <div>
            <h4 className="mb-4 font-semibold text-foreground">
              Informations Légales
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#FFD700] transition-colors"
                >
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#FFD700] transition-colors"
                >
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-[#FFD700] transition-colors"
                >
                  Jeu responsable
                </a>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Age Warning */}
        <Alert className="border-[#FF3B30] bg-[#FF3B30]/10">
          <AlertTriangle className="h-4 w-4 text-[#FF3B30]" />
          <AlertDescription className="text-sm text-foreground">
            <strong>Jeu interdit aux moins de 18 ans.</strong>{" "}
            Jouer comporte des risques : endettement, isolement,
            dépendance. Pour être aidé, appelez le
            09-74-75-13-13 (appel non surtaxé).
          </AlertDescription>
        </Alert>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Africa Millions. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}