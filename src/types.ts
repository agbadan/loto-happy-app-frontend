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
export interface Withdrawal {
  id: string;
  amount: number;
  provider: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string; // Note: le backend utilise snake_case ici
  player: {
    id: string;
    username: string;
    phone_number: string; // Note: le backend utilise snake_case ici
  } | null;
}

// --- TYPE POUR LES STATS FINANCIÈRES (utilisé dans AdminFinance) ---
export interface FinancialStats {
    totalCredits: number;
    totalWithdrawals: number;
    balance: number;
    pendingWithdrawalsCount: number;
}