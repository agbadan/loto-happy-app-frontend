// src/utils/adminAPI.ts

import apiClient from '../services/apiClient';
import { AdminUser } from '../types'; // Assurez-vous que le chemin vers votre fichier de types est correct

// =====================================================================
// ===== FONCTIONS POUR LE PANEL DE GESTION DES ADMINISTRATEURS ======
// =====================================================================

/**
 * Récupère la liste de tous les administrateurs.
 */
export const getAdmins = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>('/api/admin/users');
  return response.data;
};

/**
 * Crée un nouvel administrateur.
 */
export const createAdmin = async (adminData: Omit<AdminUser, 'id' | 'status' | 'createdAt'>): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>('/api/admin/users', adminData);
  return response.data;
};

/**
 * Met à jour le rôle d'un administrateur spécifique.
 */
export const updateAdminRole = async (userId: string, role: string): Promise<AdminUser> => {
  // CORRECTION : Utiliser le paramètre 'userId' reçu par la fonction pour construire l'URL.
  const response = await apiClient.put<AdminUser>(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Met à jour le statut (actif/suspendu) d'un administrateur.
 */
export const updateAdminStatus = async (userId: string, status: 'active' | 'suspended'): Promise<AdminUser> => {
  // CORRECTION : Utiliser le paramètre 'userId' pour construire l'URL.
  const response = await apiClient.put<AdminUser>(`/api/admin/users/${userId}/status`, { status });
  return response.data;
};