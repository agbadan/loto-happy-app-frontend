// src/utils/adminAPI.ts

import apiClient from '../services/apiClient';

// Interface pour un utilisateur admin, basée sur la réponse du backend
export interface AdminUser {
  id: string; // Le backend renvoie 'id'
  username: string;
  email: string;
  phoneNumber: string | null;
  role: 'Super Admin' | 'Admin Financier' | 'Admin du Jeu' | 'Support Client';
  status: 'active' | 'suspended'; // Le backend utilise des minuscules
  createdAt: string;
  lastLogin: string | null;
}

// 1. Lister tous les admins
export const getAllAdminsAPI = async (): Promise<AdminUser[]> => {
  // URL confirmée par le backend
  const response = await apiClient.get<AdminUser[]>('/api/admin/users');
  return response.data;
};

// 2. Créer un nouvel admin
// Le type 'any' sera remplacé par une interface stricte
interface CreateAdminPayload {
    username: string;
    email: string;
    password: string;
    role: 'Super Admin' | 'Admin Financier' | 'Admin du Jeu' | 'Support Client';
}
export const createAdminAPI = async (adminData: CreateAdminPayload): Promise<AdminUser> => {
  // URL confirmée par le backend
  const response = await apiClient.post<AdminUser>('/api/admin/users', adminData);
  return response.data;
};

// 3. Mettre à jour le rôle d'un admin
export const updateAdminRoleAPI = async (adminId: string, role: string): Promise<AdminUser> => {
  // URL confirmée par le backend
  const response = await apiClient.put<AdminUser>(`/api/admin/users/${adminId}/role`, { role });
  return response.data;
};

// 4. Mettre à jour le statut d'un admin (peut être réutilisé depuis un autre fichier mais on le met ici pour la clarté)
export const updateAdminStatusAPI = async (adminId: string, status: 'active' | 'suspended'): Promise<void> => {
    await apiClient.put(`/api/admin/users/${adminId}/status`, { status });
};