// src/utils/playerAPI.ts
import apiClient from '../services/apiClient';

// L'interface complète, basée sur la réponse exacte du backend
export interface Player {
  id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: "player";
  status: "active" | "suspended";
  createdAt: string;
  lastLogin: string | null;
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance: number;
}

// La réponse de l'API est paginée, donc nous définissons un type pour cela
// (à adapter si le backend renvoie aussi le nombre total de pages, etc.)
export interface PaginatedPlayersResponse {
  items: Player[];
  total: number;
  page: number;
  size: number;
  pages: number;
}


// La fonction qui récupère une page de joueurs
export const getPlayersPage = async (page: number = 1, size: number = 10): Promise<PaginatedPlayersResponse> => {
  try {
    const response = await apiClient.get<PaginatedPlayersResponse>('/api/players', {
      params: { // On passe les paramètres de pagination à Axios
        page,
        size
      }
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération d'une page de joueurs:", error);
    throw error; // On propage l'erreur pour que le composant puisse la gérer
  }
};