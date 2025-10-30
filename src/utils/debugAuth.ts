// Fonctions de débogage pour tester le système d'authentification

import { getAllPlayers, getAllResellers, getCurrentUser } from './auth';

export function debugShowAllPlayers() {
  const players = getAllPlayers();
  console.log('=== TOUS LES JOUEURS ENREGISTRÉS ===');
  console.log('Nombre total:', players.length);
  players.forEach((player, index) => {
    console.log(`\n${index + 1}. ${player.username}`);
    console.log('   Téléphone:', player.phoneNumber);
    console.log('   Rôle:', player.role);
    console.log('   Solde Jeu:', player.balanceGame);
    console.log('   Solde Gains:', player.balanceWinnings);
  });
  console.log('=====================================\n');
}

export function debugShowAllResellers() {
  const resellers = getAllResellers();
  console.log('=== TOUS LES REVENDEURS ===');
  console.log('Nombre total:', resellers.length);
  resellers.forEach((reseller, index) => {
    console.log(`\n${index + 1}. ${reseller.username}`);
    console.log('   Téléphone:', reseller.phoneNumber);
    console.log('   Jetons:', reseller.tokenBalance);
    console.log('   Rechargé Aujourd\'hui:', reseller.dailyRechargeTotal);
    console.log('   Transactions:', reseller.dailyTransactionsCount);
  });
  console.log('===========================\n');
}

export function debugShowCurrentUser() {
  const user = getCurrentUser();
  console.log('=== UTILISATEUR ACTUEL ===');
  if (user) {
    console.log('Username:', user.username);
    console.log('Téléphone:', user.phoneNumber);
    console.log('Rôle:', user.role);
    console.log('Connecté:', user.isLoggedIn);
    console.log('Solde Jeu:', user.balanceGame);
    console.log('Solde Gains:', user.balanceWinnings);
    if (user.role === 'reseller') {
      console.log('Jetons:', user.tokenBalance);
      console.log('Rechargé Aujourd\'hui:', user.dailyRechargeTotal);
      console.log('Transactions:', user.dailyTransactionsCount);
    }
  } else {
    console.log('Aucun utilisateur connecté');
  }
  console.log('==========================\n');
}

export function debugClearAllData() {
  localStorage.removeItem('lottoHappyUser');
  localStorage.removeItem('lottoHappyAllPlayers');
  localStorage.removeItem('lottoHappyAllResellers');
  console.log('✅ Toutes les données ont été effacées');
}

// Rendre les fonctions accessibles globalement pour le débogage
if (typeof window !== 'undefined') {
  (window as any).debugAuth = {
    showAllPlayers: debugShowAllPlayers,
    showAllResellers: debugShowAllResellers,
    showCurrentUser: debugShowCurrentUser,
    clearAllData: debugClearAllData,
  };
  console.log('🔧 Fonctions de débogage disponibles:');
  console.log('   window.debugAuth.showAllPlayers() - Afficher tous les joueurs');
  console.log('   window.debugAuth.showAllResellers() - Afficher tous les revendeurs');
  console.log('   window.debugAuth.showCurrentUser() - Afficher l\'utilisateur actuel');
  console.log('   window.debugAuth.clearAllData() - Effacer toutes les données');
}