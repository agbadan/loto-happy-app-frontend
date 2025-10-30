// 🔧 Script de débogage pour les revendeurs
// Ouvrir la console et taper : debugResellers()

import { getAllResellers, createReseller, hashPassword } from './auth';

// Fonction pour déboguer les revendeurs
export function debugResellers() {
  console.log('=== 🔍 DEBUG REVENDEURS ===');
  
  const resellers = getAllResellers();
  console.log(`📊 Nombre total de revendeurs: ${resellers.length}`);
  
  console.log('\n📋 Liste des revendeurs:');
  resellers.forEach((r, index) => {
    console.log(`\n${index + 1}. ${r.username}`);
    console.log(`   📞 Téléphone: ${r.phoneNumber}`);
    console.log(`   📧 Email: ${r.email}`);
    console.log(`   💰 Solde Jetons: ${(r.tokenBalance || 0).toLocaleString('fr-FR')} F`);
    console.log(`   ✅ Statut: ${r.status || 'active'}`);
    console.log(`   🔑 Hash Password: ${r.password.substring(0, 20)}...`);
  });
  
  // Vérifier le localStorage
  const storedResellers = localStorage.getItem('loto_happy_resellers');
  console.log('\n💾 Données brutes localStorage (loto_happy_resellers):');
  console.log(storedResellers ? JSON.parse(storedResellers) : 'Vide');
  
  // Vérifier le store unifié
  const unifiedStore = localStorage.getItem('loto_happy_users');
  console.log('\n🔗 Store unifié (loto_happy_users):');
  const users = unifiedStore ? JSON.parse(unifiedStore) : [];
  const resellersInUnified = users.filter((u: any) => u.role === 'reseller');
  console.log(`   Revendeurs dans le store unifié: ${resellersInUnified.length}`);
  
  return {
    total: resellers.length,
    resellers: resellers.map(r => ({
      username: r.username,
      phone: r.phoneNumber,
      email: r.email,
      status: r.status,
      tokenBalance: r.tokenBalance
    }))
  };
}

// Tester la création d'un revendeur
export function testCreateReseller() {
  console.log('=== 🧪 TEST CRÉATION REVENDEUR ===');
  
  const testData = {
    username: 'TEST_DEBUG_' + Date.now(),
    phoneNumber: '228' + Math.floor(Math.random() * 100000000),
    email: `test.debug.${Date.now()}@lotohappy.com`,
    password: 'Test123',
    tokenBalance: 50000
  };
  
  console.log('📝 Création avec les données:', testData);
  
  const result = createReseller(
    testData.username,
    testData.phoneNumber,
    testData.email,
    testData.password,
    testData.tokenBalance
  );
  
  console.log('📊 Résultat:', result);
  
  if (result.success) {
    console.log('✅ Revendeur créé avec succès !');
    console.log('🔑 Pour se connecter:');
    console.log(`   Numéro: ${testData.phoneNumber}`);
    console.log(`   Mot de passe: ${testData.password}`);
    
    // Vérifier immédiatement
    setTimeout(() => {
      const resellers = getAllResellers();
      const found = resellers.find(r => r.phoneNumber === testData.phoneNumber);
      console.log('\n🔍 Vérification dans la liste:', found ? '✅ Trouvé' : '❌ Non trouvé');
      if (found) {
        console.log('   Username:', found.username);
        console.log('   Status:', found.status);
        console.log('   Token Balance:', found.tokenBalance);
      }
    }, 100);
  } else {
    console.log('❌ Échec de la création:', result.message);
  }
  
  return result;
}

// Tester la connexion d'un revendeur
export function testResellerLogin(phoneNumber: string, password: string) {
  console.log('=== 🔐 TEST CONNEXION REVENDEUR ===');
  console.log(`📞 Numéro: ${phoneNumber}`);
  console.log(`🔑 Mot de passe: ${password}`);
  
  const resellers = getAllResellers();
  const cleanNumber = phoneNumber.replace(/[\s+]/g, '');
  
  console.log('🔍 Recherche avec numéro nettoyé:', cleanNumber);
  
  const found = resellers.find(r => r.phoneNumber === cleanNumber);
  
  if (found) {
    console.log('✅ Revendeur trouvé:', found.username);
    console.log('   Status:', found.status);
    
    const passwordHash = hashPassword(password);
    const passwordMatch = found.password === passwordHash;
    
    console.log('🔑 Vérification mot de passe:');
    console.log('   Hash saisi:', passwordHash.substring(0, 30) + '...');
    console.log('   Hash stocké:', found.password.substring(0, 30) + '...');
    console.log('   Match:', passwordMatch ? '✅ OUI' : '❌ NON');
    
    if (passwordMatch && found.status !== 'suspended') {
      console.log('✅ Connexion devrait réussir !');
      return true;
    } else if (found.status === 'suspended') {
      console.log('❌ Compte suspendu');
      return false;
    } else {
      console.log('❌ Mot de passe incorrect');
      return false;
    }
  } else {
    console.log('❌ Revendeur non trouvé');
    console.log('📋 Revendeurs disponibles:');
    resellers.forEach(r => {
      console.log(`   - ${r.username}: ${r.phoneNumber}`);
    });
    return false;
  }
}

// Nettoyer tous les revendeurs de test
export function cleanupTestResellers() {
  console.log('=== 🧹 NETTOYAGE REVENDEURS TEST ===');
  
  const resellers = getAllResellers();
  const testResellers = resellers.filter(r => 
    r.username.startsWith('TEST_') || 
    r.email.includes('test.debug')
  );
  
  console.log(`🗑️ ${testResellers.length} revendeurs de test trouvés`);
  testResellers.forEach(r => {
    console.log(`   - ${r.username} (${r.phoneNumber})`);
  });
  
  if (testResellers.length > 0) {
    console.log('\n⚠️ Pour les supprimer, utilisez la fonction Admin');
  }
  
  return testResellers;
}

// Exporter pour utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).debugResellers = debugResellers;
  (window as any).testCreateReseller = testCreateReseller;
  (window as any).testResellerLogin = testResellerLogin;
  (window as any).cleanupTestResellers = cleanupTestResellers;
  
  console.log('🔧 Fonctions de debug disponibles:');
  console.log('   - debugResellers() : Afficher tous les revendeurs');
  console.log('   - testCreateReseller() : Créer un revendeur de test');
  console.log('   - testResellerLogin(phone, password) : Tester une connexion');
  console.log('   - cleanupTestResellers() : Lister les revendeurs de test');
}
