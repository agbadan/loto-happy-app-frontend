import axios from 'axios';

/**
 * Récupère le token d'authentification depuis le stockage local.
 * Adaptez cette fonction si vous utilisez une autre méthode de stockage (ex: cookies).
 */
const getToken = (): string | null => {
  // Pour l'instant, on suppose que le token est stocké dans localStorage.
  // C'est simple pour le développement, mais pour la production,
  // une solution plus sécurisée comme les cookies httpOnly est recommandée.
  return localStorage.getItem('authToken');
};

/**
 * Crée une instance d'Axios pré-configurée pour notre API.
 * 
 * - Définit l'URL de base de l'API à partir des variables d'environnement.
 * - Ajoute automatiquement le token JWT à chaque requête sortante.
 * - Ajoute le header pour contourner la page d'avertissement de ngrok.
 */
const apiClient = axios.create({
  // Utilise la variable d'environnement définie dans le fichier .env du projet frontend.
  // Assurez-vous que votre fichier .env contient :
  // REACT_APP_API_BASE_URL=https://votre-url-ngrok.ngrok-free.app
  baseURL: process.env.REACT_APP_API_BASE_URL,
  
  // --- CORRECTION APPLIQUÉE ICI ---
  // On définit des headers par défaut pour toutes les requêtes.
  headers: {
    // Ce header est nécessaire pour que les requêtes API vers ngrok
    // ne soient pas bloquées par la page d'avertissement de ngrok.
    'ngrok-skip-browser-warning': 'true'
  }
});

// Intercepteur de requête : s'exécute AVANT chaque requête.
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // Si un token existe, on l'ajoute au header 'Authorization'.
      // Cela n'écrase pas les headers définis dans `create`.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Gérer les erreurs de configuration de la requête.
    return Promise.reject(error);
  }
);

// Intercepteur de réponse : s'exécute APRÈS chaque réponse.
// Utile pour gérer globalement les erreurs d'authentification.
apiClient.interceptors.response.use(
  (response) => {
    // Si la réponse est un succès, on la retourne directement.
    return response;
  },
  (error) => {
    // Si on reçoit une erreur 401 (Non autorisé), cela signifie que le token
    // est invalide ou a expiré. On peut déconnecter l'utilisateur.
    if (error.response && error.response.status === 401) {
      // Supprimer le token invalide.
      localStorage.removeItem('authToken');
      // Rediriger vers la page de connexion.
      // window.location.href = '/login'; // Décommentez si vous voulez une redirection automatique.
      console.error("Authentication Error: Token is invalid or expired. Please log in again.");
    }
    // Propager l'erreur pour que le composant qui a fait l'appel puisse aussi la gérer.
    return Promise.reject(error);
  }
);


export default apiClient;