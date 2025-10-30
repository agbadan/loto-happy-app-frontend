/**
 * Configuration de l'application
 */

export const CONFIG = {
  // Mode développement : utilise localStorage si le backend n'est pas accessible
  // Mettre à false pour forcer l'utilisation du backend
  USE_LOCALHOST_FALLBACK: false,
  
  // URL du backend
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://together-fresh-alien.ngrok-free.app',
  
  // Afficher les logs de développement
  DEBUG: true,
};
