// src/utils/playerAPI.ts

import apiClient from '../services/apiClient';

// On importe l'interface de transaction depuis un fichier partagé pour éviter la duplication
// (si ce fichier n'existe pas, on peut la redéfinir ici)
import { PlayerTransaction } from './transactionsAPI'; // Supposons que transactionsAPI.ts existe

/**
 * Récupère l'historique des transactions de l'utilisateur connecté.
 */
export const getMyTransactionHistory = async (): Promise<PlayerTransaction[]> => {
  const response = await apiClient.get<PlayerTransaction[]>('/api/players/me/transactions');
  return response.data;
};