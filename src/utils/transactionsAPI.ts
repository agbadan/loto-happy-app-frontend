// src/utils/transactionsAPI.ts
// Ce fichier contiendra les interfaces partagées liées aux transactions.

export interface PlayerTransaction {
  id: string;
  type: 'RECHARGE' | 'BET' | 'CONVERSION' | 'WIN' | 'WITHDRAWAL' | 'REFUND';
  description: string;
  amount: number;
  balanceAfterGame: number;
  balanceAfterWinnings: number;
  date: string;
  metadata?: Record<string, any>;
}