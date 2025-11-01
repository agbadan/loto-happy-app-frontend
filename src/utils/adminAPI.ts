// src/utils/adminAPI.ts

import apiClient from '../services/apiClient';
import { AdminUser } from '../types'; // Assurez-vous que le type AdminUser est défini dans src/types.ts

/**
 * Récupère la liste de tous les utilisateurs administrateurs.
 */
export const getAdmins = async (): Promise<AdminUser[]> => {
  const response = await apiClient.get<AdminUser[]>('/api/admin/users/');
  return response.data;
};

/**
 * Crée un nouvel utilisateur administrateur.
 */
export const createAdmin = async (adminData: Omit<AdminUser, 'id'>): Promise<AdminUser> => {
  const response = await apiClient.post<AdminUser>('/api/admin/users/', adminData);
  return response.data;
};

/**
 * Met à jour le rôle d'un administrateur.
 */
export const updateAdminRole = async (userId: string, role: string): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Met à jour le statut d'un administrateur (actif/inactif).
 */
export const updateAdminStatus = async (userId: string, isActive: boolean): Promise<AdminUser> => {
  const response = await apiClient.patch<AdminUser>(`/api/admin/users/${userId}/status`, { is_active: isActive });
  return response.data;
};