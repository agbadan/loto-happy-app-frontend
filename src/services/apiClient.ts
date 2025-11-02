// src/services/apiClient.ts

/**
 * Client API centralisé pour toutes les requêtes vers le backend
 * Gère automatiquement l'ajout du token JWT et les erreurs
 */

import { CONFIG } from '../utils/config'; // Assurez-vous que ce chemin est correct

// Configuration de l'URL du backend
const API_BASE_URL = CONFIG.API_BASE_URL;

// Export pour fallback
export const DEV_MODE = {
  useLocalStorageFallback: CONFIG.USE_LOCALHOST_FALLBACK,
};

// Clé pour stocker le token JWT
const TOKEN_KEY = 'loto_happy_access_token';

// ===== GESTION DU TOKEN =====

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ===== CLASSE D'ERREUR API =====

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ===== FONCTION GÉNÉRIQUE D'APPEL API =====

interface ApiCallOptions extends RequestInit {
  useFormData?: boolean; // Pour les endpoints qui attendent form-urlencoded
  skipAuth?: boolean; // Pour les endpoints publics
}

export async function apiCall<T = any>(
  endpoint: string,
  options: ApiCallOptions = {}
): Promise<T> {
  const { useFormData = false, skipAuth = false, ...fetchOptions } = options;

  // Préparer les headers
  const headers: Record<string, string> = {
    ...fetchOptions.headers as Record<string, string>,
  };

  // Ajouter le token si disponible et requis
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Pour les POST/PUT, ajouter Content-Type si non spécifié
  if (!useFormData && (options.method === 'POST' || options.method === 'PUT')) {
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    // Gérer les erreurs HTTP
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        throw new ApiError(
          'NETWORK_ERROR',
          'Erreur de communication avec le serveur',
          undefined,
          response.status
        );
      }

      // Format d'erreur backend
      if (errorData.detail && typeof errorData.detail === 'object' && errorData.detail.error) {
        const apiError = errorData.detail.error;
        throw new ApiError(
          apiError.code || 'UNKNOWN_ERROR',
          apiError.message || 'Une erreur est survenue',
          apiError.details,
          response.status
        );
      }

      // Format d'erreur simple
      throw new ApiError(
        'API_ERROR',
        errorData.detail || errorData.message || 'Une erreur est survenue',
        errorData,
        response.status
      );
    }

    // Réponse vide (204, DELETE, etc.)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null as T;
    }

    // Parser la réponse JSON
    const data = await response.json();
    
    // Retourner les données (le backend peut renvoyer { data: ... } ou directement l'objet)
    return (data.data !== undefined ? data.data : data) as T;

  } catch (error) {
    // Propager les ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Erreur réseau ou autre
    throw new ApiError(
      'NETWORK_ERROR',
      'Impossible de contacter le serveur. Vérifiez votre connexion.',
      { originalError: (error as Error).message }
    );
  }
}

// ===== HELPERS POUR LES MÉTHODES HTTP =====

export const api = {
  get: <T = any>(endpoint: string, options?: ApiCallOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: ApiCallOptions) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'POST',
      body: options?.useFormData ? body : JSON.stringify(body),
    }),

  put: <T = any>(endpoint: string, body?: any, options?: ApiCallOptions) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: options?.useFormData ? body : JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string, options?: ApiCallOptions) =>
    apiCall<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = any>(endpoint: string, body?: any, options?: ApiCallOptions) =>
    apiCall<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: options?.useFormData ? body : JSON.stringify(body),
    }),
};

export default api;