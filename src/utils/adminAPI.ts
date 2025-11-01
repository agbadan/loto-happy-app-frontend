// src/utils/adminAPI.ts

import apiClient from '../services/apiClient';
import { AdminUser } from '../types'; 

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
 * CORRECTION: La méthode est changée de PATCH à PUT.
 */
export const updateAdminRole = async (userId: string, role: string): Promise<AdminUser> => {
  const response = await apiClient.put<AdminUser>(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Met à jour le statut d'un administrateur (actif/suspendu).
 * CORRECTION: La méthode est changée de PATCH à PUT et le payload est ajusté.
 */
export const updateAdminStatus = async (userId: string, status: 'active' | 'suspended'): Promise<AdminUser> => {
  const response = await apiClient.put<AdminUser>(`/api/admin/users/${userId}/status`, { status });
  return response.data;
};