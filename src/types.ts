// src/types.ts

// --- TYPE UTILISATEUR GÉNÉRIQUE ---
export interface User {
  id: string;
  username: string;
  phoneNumber: string;
  email: string;
  role: string; // 'player', 'reseller', 'Super Admin', etc.
  status: 'active' | 'suspended';
  balanceGame?: number;
  balanceWinnings?: number;
  tokenBalance?: number;
  createdAt: string;
  lastLogin: string | null;
}

// --- TYPE SPÉCIFIQUE POUR LES ADMINS (utilisé dans AdminAdministrators) ---
export interface AdminUser extends User {
  // Cette interface hérite de toutes les propriétés de User
  // Vous pouvez ajouter des champs spécifiques aux admins ici si nécessaire
}

// --- TYPE POUR LES RETRAITS (utilisé dans AdminFinance) ---
// MIS À JOUR pour correspondre à la structure de l'API
export interface Withdrawal {
  id: string;
  amount: number;
  provider: string;
  withdrawalPhoneNumber: string; // Numéro utilisé pour le retrait
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string; // Le champ correct pour la date
  processedDate: string | null;
  processedBy: string | null;
  playerInfo: { // Le sous-objet correct
    id: string;
    username: string;
    phoneNumber: string; // Numéro de téléphone principal du joueur
  };
}
// --- TYPE POUR LES STATS FINANCIÈRES (utilisé dans AdminFinance) ---
export interface FinancialStats {
    totalCredits: number;
    totalWithdrawals: number;
    balance: number;
    pendingWithdrawalsCount: number;
}