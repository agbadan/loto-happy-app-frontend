// Script de migration pour corriger les numéros de téléphone existants

export function migratePhoneNumbers() {
  console.log('🔄 Migration des numéros de téléphone...');
  
  // Migrer l'utilisateur actuel
  const currentUserData = localStorage.getItem('lottoHappyUser');
  if (currentUserData) {
    try {
      const user = JSON.parse(currentUserData);
      if (user.phoneNumber && user.phoneNumber.includes('+')) {
        user.phoneNumber = user.phoneNumber.replace(/\+/g, '');
        localStorage.setItem('lottoHappyUser', JSON.stringify(user));
        console.log('✅ Utilisateur actuel migré:', user.phoneNumber);
      }
    } catch (e) {
      console.error('❌ Erreur migration utilisateur actuel:', e);
    }
  }
  
  // Migrer tous les joueurs
  const allPlayersData = localStorage.getItem('lottoHappyAllPlayers');
  if (allPlayersData) {
    try {
      const players = JSON.parse(allPlayersData);
      let migrated = 0;
      
      players.forEach((player: any) => {
        if (player.phoneNumber && player.phoneNumber.includes('+')) {
          player.phoneNumber = player.phoneNumber.replace(/\+/g, '');
          migrated++;
        }
      });
      
      if (migrated > 0) {
        localStorage.setItem('lottoHappyAllPlayers', JSON.stringify(players));
        console.log(`✅ ${migrated} joueur(s) migré(s)`);
      } else {
        console.log('✅ Joueurs : Aucune migration nécessaire');
      }
    } catch (e) {
      console.error('❌ Erreur migration joueurs:', e);
    }
  }
  
  // Migrer tous les revendeurs (au cas où)
  const allResellersData = localStorage.getItem('lottoHappyAllResellers');
  if (allResellersData) {
    try {
      const resellers = JSON.parse(allResellersData);
      let migrated = 0;
      
      resellers.forEach((reseller: any) => {
        if (reseller.phoneNumber && reseller.phoneNumber.includes('+')) {
          reseller.phoneNumber = reseller.phoneNumber.replace(/\+/g, '');
          migrated++;
        }
      });
      
      if (migrated > 0) {
        localStorage.setItem('lottoHappyAllResellers', JSON.stringify(resellers));
        console.log(`✅ ${migrated} revendeur(s) migré(s)`);
      } else {
        console.log('✅ Revendeurs : Aucune migration nécessaire');
      }
    } catch (e) {
      console.error('❌ Erreur migration revendeurs:', e);
    }
  } else {
    console.log('ℹ️  Revendeurs non initialisés (normal au premier chargement)');
  }
  
  console.log('🎉 Migration terminée !');
}

// Exécuter la migration au chargement
if (typeof window !== 'undefined') {
  migratePhoneNumbers();
  
  // Rendre disponible globalement
  (window as any).migratePhoneNumbers = migratePhoneNumbers;
  console.log('💡 Vous pouvez aussi lancer manuellement: window.migratePhoneNumbers()');
}