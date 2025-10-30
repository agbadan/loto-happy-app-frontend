import { Plus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getCurrentUser } from "../utils/auth";

interface HeaderProps {
  balance?: number;
  onRecharge?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
  games?: Array<{ id: string; name: string; country: string }>;
  onGameSelect?: (gameId: string) => void;
  showGameSelector?: boolean;
}

// Fonction pour formatter le solde de manière compacte sur mobile
function formatBalance(balance: number, isMobile: boolean = false): string {
  if (!isMobile) {
    return balance.toLocaleString("fr-FR");
  }
  
  // Format compact pour mobile
  if (balance >= 1000000) {
    return `${(balance / 1000000).toFixed(1)}M`;
  } else if (balance >= 10000) {
    return `${(balance / 1000).toFixed(1)}K`;
  }
  return balance.toLocaleString("fr-FR");
}

export function Header({
  balance = 12500,
  onRecharge,
  onNotifications,
  onProfile,
  games = [],
  onGameSelect,
  showGameSelector = false,
}: HeaderProps) {
  // Récupérer l'utilisateur actuel
  const currentUser = getCurrentUser();
  const userInitials = currentUser?.username?.substring(0, 2).toUpperCase() || 'U';
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 overflow-hidden">
      <div className="container flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4 px-3 sm:px-4">
        {/* Logo - Responsive avec slogan sur mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#FF8800]">
            <span className="font-bold text-white text-xs sm:text-sm">
              LH
            </span>
          </div>
          {/* Texte + Slogan : visible sur mobile grâce au format compact du solde */}
          <div>
            <div className="font-bold text-foreground text-sm sm:text-base">
              Lotto Happy
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
              Votre gain notre priorité
            </div>
          </div>
        </div>

        {/* Actions - Format compact sur mobile */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Balance - Format compact sur mobile, complet sur desktop */}
          <div className="flex items-center gap-1 sm:gap-2 rounded-full bg-muted px-2 sm:px-3 py-1 sm:py-1.5">
            {/* Format desktop : afficher tout */}
            <span className="font-semibold text-[#FFD700] hidden sm:inline text-sm">
              {balance.toLocaleString("fr-FR")} F
            </span>
            
            {/* Format mobile : compact */}
            <span className="font-semibold text-[#FFD700] sm:hidden text-xs">
              {formatBalance(balance, true)} F
            </span>
            
            <Button
              size="icon"
              className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-[#FFD700] hover:bg-[#FFD700]/90"
              onClick={onRecharge}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-[#121221]" />
            </Button>
          </div>
          
          {/* Profile Avatar - Plus petit sur mobile */}
          <Avatar
            className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer ring-2 ring-[#FFD700]/20 hover:ring-[#FFD700]/40 transition-all flex-shrink-0"
            onClick={onProfile}
          >
            <AvatarImage
              src="https://avatar.vercel.sh/user"
              alt="Profile"
            />
            <AvatarFallback className="bg-gradient-gold text-[#121212] text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}