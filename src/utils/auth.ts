// Système de gestion d'authentification avec localStorage

// Interface pour les transactions des joueurs
export interface PlayerTransaction {
  id: string;
  type: 'RECHARGE' | 'BET' | 'CONVERSION' | 'WIN' | 'WITHDRAWAL';
  description: string;
  amount: number;
  balanceAfter: number;
  date: string;
  metadata?: {
    gameName?: string;
    resellerName?: string;
    fromBalance?: 'winnings' | 'game';
    toBalance?: 'winnings' | 'game';
    provider?: string; // Opérateur Mobile Money
    phoneNumber?: string; // Numéro de retrait
  };
}

// Interface pour les demandes de retrait
export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  phoneNumber: string; // Numéro du joueur
  amount: number;
  provider: string; // Opérateur Mobile Money
  withdrawalPhoneNumber: string; // Numéro vers lequel envoyer l'argent
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
}

// Interface pour les administrateurs
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'Super Admin' | 'Admin Financier' | 'Admin du Jeu' | 'Support Client';
  status: 'Actif' | 'Désactivé';
  lastLogin: string;
  createdAt: string;
}

export interface User {
  id: string; // ID unique pour chaque utilisateur
  isLoggedIn: boolean;
  username: string;
  phoneNumber: string;
  email: string; // Email REQUIS pour tous les utilisateurs
  password: string; // Stocké hashé (vide si connexion Google)
  authMethod?: 'password' | 'google'; // Méthode d'authentification
  role: 'player' | 'reseller' | 'admin'; // Nouveau champ pour distinguer les rôles
  balanceGame: number;
  balanceWinnings: number;
  tokenBalance?: number; // Pour les revendeurs uniquement
  dailyRechargeTotal?: number; // Montant total rechargé aujourd'hui
  dailyTransactionsCount?: number; // Nombre de transactions aujourd'hui
  transactionHistory?: Array<{ // Pour les revendeurs uniquement
    id: string;
    playerNumber: string;
    playerUsername: string;
    amount: number;
    date: string;
  }>;
  playerTransactionHistory?: PlayerTransaction[]; // Pour les joueurs uniquement
  status?: 'active' | 'suspended'; // Statut du compte (pour gestion admin)
}

// Clés de stockage
const STORAGE_KEY = 'lottoHappyUser';
const ALL_PLAYERS_KEY = 'lottoHappyAllPlayers'; // Stockage de tous les joueurs
const ALL_RESELLERS_KEY = 'lottoHappyAllResellers'; // Stockage de tous les revendeurs
const USERS_KEY = 'loto_happy_users'; // Nouvelle clé unifiée pour tous les utilisateurs
const WITHDRAWAL_REQUESTS_KEY = 'loto_happy_withdrawal_requests'; // Demandes de retrait
const ADMIN_USERS_KEY = 'lottoHappyAdmins'; // Stockage de tous les administrateurs

// Générer un ID unique
function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ===== VALIDATION DES NUMÉROS DE TÉLÉPHONE ET OPÉRATEURS MOBILE MONEY =====

// Configuration des formats de numéros par pays
interface PhoneFormat {
  code: string;
  length: number; // Nombre de chiffres APRÈS l'indicatif
  name: string;
}

export const PHONE_FORMATS: PhoneFormat[] = [
  { code: '+228', length: 8, name: 'Togo' },
  { code: '+229', length: 8, name: 'Bénin' },
  { code: '+225', length: 10, name: 'Côte d\'Ivoire' },
  { code: '+233', length: 9, name: 'Ghana' },
  { code: '+226', length: 8, name: 'Burkina Faso' },
];

// Configuration des opérateurs Mobile Money par pays
export interface MobileMoneyOperator {
  id: string;
  name: string;
  icon: string;
  color: string;
  prefixes: string[]; // Préfixes acceptés (ex: ['90', '70', '91'])
  countries: string[]; // Codes pays supportés (ex: ['+228'])
}

export const MOBILE_MONEY_OPERATORS: MobileMoneyOperator[] = [
  {
    id: 'yas',
    name: 'Yas Togo (ex T-Money)',
    icon: '💰',
    color: '#FF6B00',
    prefixes: ['90', '70', '73', '93', '91'],
    countries: ['+228'],
  },
  {
    id: 'moov-togo',
    name: 'Moov Money Togo',
    icon: '📱',
    color: '#009DD9',
    prefixes: ['98', '78', '79', '99', '97'],
    countries: ['+228'],
  },
  {
    id: 'mtn-togo',
    name: 'MTN Mobile Money',
    icon: '📞',
    color: '#FFCB05',
    prefixes: ['92', '93', '94', '95', '96'], // MTN Togo (à confirmer)
    countries: ['+228', '+229', '+225', '+233', '+226'],
  },
  {
    id: 'moov-benin',
    name: 'Moov Money Bénin',
    icon: '💳',
    color: '#009DD9',
    prefixes: ['96', '97', '61', '62', '63'], // Moov Bénin
    countries: ['+229'],
  },
  {
    id: 'orange',
    name: 'Orange Money',
    icon: '🍊',
    color: '#FF7900',
    prefixes: ['07', '08', '09', '57', '58', '59', '67', '68', '69'], // Multi-pays
    countries: ['+225', '+226', '+229'],
  },
  {
    id: 'wave',
    name: 'Wave',
    icon: '🌊',
    color: '#4F46E5',
    prefixes: ['91', '92', '93', '94', '95'], // Wave multi-pays
    countries: ['+221', '+225', '+229'],
  },
  {
    id: 'flooz',
    name: 'Flooz (Moov)',
    icon: '💵',
    color: '#00B4D8',
    prefixes: ['96', '97', '98', '99'],
    countries: ['+228'],
  },
];

// Numéros de revendeurs (sans indicatif) pour vérification
const RESELLER_NUMBERS = [
  '990102030', // Togo - GREGOIRE_RT
  '660102030', // Bénin - MAISON_LOTO
  '070102030', // Côte d'Ivoire - CHANCE_PLUS
  '240102030', // Ghana - GOLDEN_LOTO
  '550102030', // Burkina Faso - MEGA_CHANCE
];

// Vérifier si un numéro est un numéro de revendeur
export function isResellerNumber(phoneNumber: string): boolean {
  // Nettoyer le numéro (retirer espaces, tirets, etc.)
  const cleanNumber = phoneNumber.replace(/[\s\-\.]/g, '');
  
  // Vérifier si le numéro se termine par un numéro de revendeur
  return RESELLER_NUMBERS.some(resellerNum => cleanNumber.endsWith(resellerNum));
}

// Détecter l'opérateur à partir d'un numéro et d'un code pays
export function detectOperatorFromNumber(
  phoneNumber: string, 
  countryCode: string
): MobileMoneyOperator | null {
  const cleanNumber = phoneNumber.replace(/[\s\-\.]/g, '');
  
  // Chercher un opérateur correspondant au pays et au préfixe
  for (const operator of MOBILE_MONEY_OPERATORS) {
    if (operator.countries.includes(countryCode)) {
      for (const prefix of operator.prefixes) {
        if (cleanNumber.startsWith(prefix)) {
          return operator;
        }
      }
    }
  }
  
  return null;
}

// Vérifier si un numéro correspond à un opérateur spécifique
export function validateNumberForOperator(
  phoneNumber: string,
  countryCode: string,
  operatorId: string
): { isValid: boolean; message?: string } {
  const cleanNumber = phoneNumber.replace(/[\s\-\.]/g, '');
  
  // Trouver l'opérateur
  const operator = MOBILE_MONEY_OPERATORS.find(op => op.id === operatorId);
  if (!operator) {
    return { isValid: false, message: 'Opérateur non reconnu' };
  }
  
  // Vérifier que l'opérateur est disponible dans ce pays
  if (!operator.countries.includes(countryCode)) {
    return { 
      isValid: false, 
      message: `${operator.name} n'est pas disponible dans ce pays` 
    };
  }
  
  // Vérifier le préfixe
  const hasValidPrefix = operator.prefixes.some(prefix => 
    cleanNumber.startsWith(prefix)
  );
  
  if (!hasValidPrefix) {
    const prefixesStr = operator.prefixes.join(', ');
    return {
      isValid: false,
      message: `Pour ${operator.name}, le numéro doit commencer par : ${prefixesStr}`
    };
  }
  
  return { isValid: true };
}

// Obtenir les opérateurs disponibles pour un pays
export function getOperatorsForCountry(countryCode: string): MobileMoneyOperator[] {
  return MOBILE_MONEY_OPERATORS.filter(op => 
    op.countries.includes(countryCode)
  );
}

// Valider le format d'un numéro de téléphone selon l'indicatif
export function validatePhoneNumber(
  phoneNumber: string, 
  countryCode: string
): { isValid: boolean; message?: string } {
  // Nettoyer le numéro (retirer espaces, tirets, etc.)
  const cleanNumber = phoneNumber.replace(/[\s\-\.]/g, '');
  
  // Vérifier si c'est un numéro de revendeur (toujours accepté)
  if (isResellerNumber(phoneNumber)) {
    return { isValid: true };
  }
  
  // Trouver le format attendu pour ce pays
  const format = PHONE_FORMATS.find(f => f.code === countryCode);
  
  if (!format) {
    return { 
      isValid: false, 
      message: 'Indicatif pays non reconnu' 
    };
  }
  
  // Vérifier que le numéro ne contient que des chiffres
  if (!/^\d+$/.test(cleanNumber)) {
    return { 
      isValid: false, 
      message: 'Le numéro ne doit contenir que des chiffres' 
    };
  }
  
  // Vérifier la longueur
  if (cleanNumber.length !== format.length) {
    return { 
      isValid: false, 
      message: `Le numéro ${format.name} doit contenir ${format.length} chiffres (${cleanNumber.length} saisis)` 
    };
  }
  
  return { isValid: true };
}

// Fonction de hashage simple (pour prototype)
export function hashPassword(password: string): string {
  return 'hashed_' + password;
}

// ===== REVENDEURS EN DUR (Constante - Valeurs par défaut) =====
const RESELLERS_DEFAULT: User[] = [
  {
    id: generateUserId(),
    isLoggedIn: false,
    username: 'GREGOIRE_RT',
    phoneNumber: '228990102030',
    email: 'gregoire.rt@lotohappy.com',
    password: hashPassword('Revendeur1'),
    authMethod: 'password',
    role: 'reseller',
    balanceGame: 0,
    balanceWinnings: 0,
    tokenBalance: 1500000,
    dailyRechargeTotal: 0,
    dailyTransactionsCount: 0,
    transactionHistory: [],
  },
  {
    id: generateUserId(),
    isLoggedIn: false,
    username: 'MAISON_LOTO',
    phoneNumber: '229660102030',
    email: 'maison.loto@lotohappy.com',
    password: hashPassword('Revendeur2'),
    authMethod: 'password',
    role: 'reseller',
    balanceGame: 0,
    balanceWinnings: 0,
    tokenBalance: 2000000,
    dailyRechargeTotal: 0,
    dailyTransactionsCount: 0,
    transactionHistory: [],
  },
  {
    id: generateUserId(),
    isLoggedIn: false,
    username: 'CHANCE_PLUS',
    phoneNumber: '225070102030',
    email: 'chance.plus@lotohappy.com',
    password: hashPassword('Revendeur3'),
    authMethod: 'password',
    role: 'reseller',
    balanceGame: 0,
    balanceWinnings: 0,
    tokenBalance: 1800000,
    dailyRechargeTotal: 0,
    dailyTransactionsCount: 0,
    transactionHistory: [],
  },
  {
    id: generateUserId(),
    isLoggedIn: false,
    username: 'GOLDEN_LOTO',
    phoneNumber: '233240102030',
    email: 'golden.loto@lotohappy.com',
    password: hashPassword('Revendeur4'),
    authMethod: 'password',
    role: 'reseller',
    balanceGame: 0,
    balanceWinnings: 0,
    tokenBalance: 2500000,
    dailyRechargeTotal: 0,
    dailyTransactionsCount: 0,
    transactionHistory: [],
  },
  {
    id: generateUserId(),
    isLoggedIn: false,
    username: 'MEGA_CHANCE',
    phoneNumber: '226550102030',
    email: 'mega.chance@lotohappy.com',
    password: hashPassword('Revendeur5'),
    authMethod: 'password',
    role: 'reseller',
    balanceGame: 0,
    balanceWinnings: 0,
    tokenBalance: 1200000,
    dailyRechargeTotal: 0,
    dailyTransactionsCount: 0,
    transactionHistory: [],
  },
];

// ===== GESTION DE TOUS LES REVENDEURS =====

// Récupérer tous les revendeurs
export function getAllResellers(): User[] {
  const resellersData = localStorage.getItem(ALL_RESELLERS_KEY);
  if (!resellersData) {
    // Premier chargement : initialiser avec les valeurs par défaut
    saveAllResellers(RESELLERS_DEFAULT);
    return RESELLERS_DEFAULT;
  }
  
  try {
    return JSON.parse(resellersData) as User[];
  } catch {
    // En cas d'erreur, réinitialiser avec les valeurs par défaut
    saveAllResellers(RESELLERS_DEFAULT);
    return RESELLERS_DEFAULT;
  }
}

// Sauvegarder tous les revendeurs
function saveAllResellers(resellers: User[]): void {
  localStorage.setItem(ALL_RESELLERS_KEY, JSON.stringify(resellers));
  // Synchroniser avec loto_happy_users pour le système de tirages
  syncToUnifiedUserStore();
}

// Ajouter ou mettre à jour un revendeur dans la liste globale
function addOrUpdateResellerInList(reseller: User): void {
  const resellers = getAllResellers();
  const existingIndex = resellers.findIndex(r => r.phoneNumber === reseller.phoneNumber);
  
  if (existingIndex !== -1) {
    // Mettre à jour le revendeur existant
    resellers[existingIndex] = reseller;
  } else {
    // Ajouter un nouveau revendeur (normalement ne devrait pas arriver)
    resellers.push(reseller);
  }
  
  saveAllResellers(resellers);
}

// Créer un nouveau revendeur (Admin uniquement)
export function createReseller(
  username: string,
  phoneNumber: string,
  email: string,
  password: string,
  tokenBalance: number = 0
): { success: boolean; message: string } {
  // Vérifier si le numéro existe déjà
  const resellers = getAllResellers();
  const existingReseller = resellers.find(r => r.phoneNumber === phoneNumber);
  
  if (existingReseller) {
    return {
      success: false,
      message: 'Un revendeur avec ce numéro de téléphone existe déjà'
    };
  }
  
  // Vérifier si l'email existe déjà
  const existingEmail = resellers.find(r => r.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return {
      success: false,
      message: 'Un revendeur avec cet email existe déjà'
    };
  }
  
  // Créer le nouveau revendeur
  const newReseller: User = {
    id: generateUserId(),
    isLoggedIn: false,
    username,
    phoneNumber,
    email,
    password: hashPassword(password),
    authMethod: 'password',
    role: 'reseller',
    balanceGame: 0,
    balanceWinnings: 0,
    tokenBalance,
    dailyRechargeTotal: 0,
    dailyTransactionsCount: 0,
    transactionHistory: [],
    status: 'active',
  };
  
  // Ajouter à la liste
  resellers.push(newReseller);
  saveAllResellers(resellers);
  
  console.log('✅ Nouveau revendeur créé:', {
    username,
    phoneNumber,
    email,
    tokenBalance
  });
  
  return {
    success: true,
    message: `✅ Revendeur ${username} créé avec succès !`
  };
}

// Initialiser les revendeurs (appelé au démarrage)
export function initializeResellers(): void {
  // S'assure que les revendeurs existent dans localStorage
  getAllResellers();
}

// ✅ Initialiser un joueur de test avec email Google (pour démo)
export function initializeTestGoogleUser(): void {
  const allPlayers = getAllPlayers();
  
  // Vérifier si le joueur test existe déjà
  const exists = allPlayers.some(p => p.email === 'joueur.test@gmail.com');
  
  if (!exists) {
    // Créer le joueur de test
    const testUser: User = {
      id: generateUserId(),
      isLoggedIn: false,
      username: 'JoueurTest228',
      email: 'joueur.test@gmail.com',
      phoneNumber: '228123456789', // Numéro réel pour le Togo
      password: hashPassword('google_auth_joueur.test@gmail.com'),
      authMethod: 'google',
      role: 'player',
      balanceGame: 5000, // Solde généreux pour les tests
      balanceWinnings: 2000,
      playerTransactionHistory: [
        {
          id: 'init_1',
          type: 'RECHARGE',
          description: 'Solde initial de test',
          amount: 5000,
          balanceAfter: 5000,
          date: new Date().toISOString(),
        },
      ],
    };
    
    allPlayers.push(testUser);
    saveAllPlayers(allPlayers);
    console.log('✅ Joueur test Google créé : joueur.test@gmail.com');
  }
}

// ===== FONCTIONS DE VALIDATION D'UNICITÉ =====

// Vérifier si un utilisateur avec ce numéro de téléphone existe (joueur ou revendeur)
export function userExistsWithPhone(phoneNumber: string): boolean {
  // Nettoyer le numéro (enlever le +)
  const cleanNumber = phoneNumber.replace(/\+/g, '');
  
  // Vérifier dans tous les joueurs
  const allPlayers = getAllPlayers();
  const playerExists = allPlayers.some(p => p.phoneNumber === cleanNumber);
  if (playerExists) return true;
  
  // Vérifier dans les revendeurs
  const allResellers = getAllResellers();
  const exists = allResellers.some(r => r.phoneNumber === cleanNumber);
  console.log('Checking for:', cleanNumber, 'Found in players:', playerExists, 'Found in resellers:', exists);
  return exists;
}

// Vérifier si un utilisateur avec cet email existe (joueur, revendeur ou admin)
export function userExistsWithEmail(email: string): User | AdminUser | null {
  const cleanEmail = email.toLowerCase().trim();
  
  // Vérifier dans tous les joueurs
  const allPlayers = getAllPlayers();
  const playerFound = allPlayers.find(p => p.email.toLowerCase() === cleanEmail);
  if (playerFound) return playerFound;
  
  // Vérifier dans les revendeurs
  const allResellers = getAllResellers();
  const resellerFound = allResellers.find(r => r.email.toLowerCase() === cleanEmail);
  if (resellerFound) return resellerFound;
  
  // Vérifier dans les admins
  const allAdmins = getAllAdmins();
  const adminFound = allAdmins.find(a => a.email.toLowerCase() === cleanEmail);
  if (adminFound) return adminFound;
  
  return null;
}

// Vérifier si un username existe (joueur ou revendeur)
export function userExistsWithUsername(username: string): boolean {
  const cleanUsername = username.toLowerCase().trim();
  
  // Vérifier dans tous les joueurs
  const allPlayers = getAllPlayers();
  const playerExists = allPlayers.some(p => p.username.toLowerCase() === cleanUsername);
  if (playerExists) return true;
  
  // Vérifier dans les revendeurs
  const allResellers = getAllResellers();
  return allResellers.some(r => r.username.toLowerCase() === cleanUsername);
}

// Vérifier si un utilisateur existe
export function userExists(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// ===== GESTION DE TOUS LES JOUEURS =====

// Récupérer tous les joueurs
export function getAllPlayers(): User[] {
  const playersData = localStorage.getItem(ALL_PLAYERS_KEY);
  if (!playersData) return [];
  
  try {
    return JSON.parse(playersData) as User[];
  } catch {
    return [];
  }
}

// Sauvegarder tous les joueurs
function saveAllPlayers(players: User[]): void {
  localStorage.setItem(ALL_PLAYERS_KEY, JSON.stringify(players));
  // Synchroniser avec loto_happy_users pour le système de tirages
  syncToUnifiedUserStore();
}

// Synchroniser tous les utilisateurs (joueurs + revendeurs + admin) vers loto_happy_users
export function syncToUnifiedUserStore(): void {
  const players = getAllPlayers();
  const resellers = getAllResellers();
  const allUsers = [...players, ...resellers];
  localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
}

// Initialiser la synchronisation au démarrage
export function initializeUserSync(): void {
  syncToUnifiedUserStore();
}

// Ajouter ou mettre à jour un joueur dans la liste globale
function addOrUpdatePlayerInList(player: User): void {
  const players = getAllPlayers();
  const existingIndex = players.findIndex(p => p.phoneNumber === player.phoneNumber);
  
  if (existingIndex !== -1) {
    // Mettre à jour le joueur existant
    players[existingIndex] = player;
  } else {
    // Ajouter un nouveau joueur
    players.push(player);
  }
  
  saveAllPlayers(players);
}

// Créer un nouvel utilisateur (Inscription classique)
export function createUser(
  username: string,
  phoneNumber: string,
  email: string,
  password: string
): { success: boolean; message: string; user?: User } {
  // Nettoyer les données
  const cleanNumber = phoneNumber.replace(/\+/g, '');
  const cleanUsername = username.trim();
  const cleanEmail = email.toLowerCase().trim();
  
  // ✅ VALIDATION 1: Vérifier si le numéro de téléphone existe déjà
  if (userExistsWithPhone(cleanNumber)) {
    return {
      success: false,
      message: 'Ce numéro de téléphone est déjà utilisé. Veuillez vous connecter ou utiliser un autre numéro.'
    };
  }
  
  // ✅ VALIDATION 2: Vérifier si l'email existe déjà
  const existingEmailUser = userExistsWithEmail(cleanEmail);
  if (existingEmailUser) {
    return {
      success: false,
      message: 'Cette adresse email est déjà utilisée. Veuillez vous connecter ou utiliser un autre email.'
    };
  }
  
  // ✅ VALIDATION 3: Vérifier si le username existe déjà
  if (userExistsWithUsername(cleanUsername)) {
    return {
      success: false,
      message: 'Ce nom d\'utilisateur est déjà pris. Veuillez en choisir un autre.'
    };
  }
  
  // Créer l'utilisateur
  const user: User = {
    id: generateUserId(),
    isLoggedIn: true,
    username: cleanUsername,
    phoneNumber: cleanNumber,
    email: cleanEmail,
    password: hashPassword(password),
    authMethod: 'password',
    role: 'player',
    balanceGame: 1000, // Solde initial de bienvenue
    balanceWinnings: 0,
    playerTransactionHistory: [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'RECHARGE',
        description: 'Bonus de bienvenue',
        amount: 1000,
        balanceAfter: 1000,
        date: new Date().toISOString(),
      }
    ],
    status: 'active',
  };
  
  // Sauvegarder comme utilisateur actuel
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  
  // Ajouter à la liste globale
  addOrUpdatePlayerInList(user);
  
  console.log('✅ Nouveau joueur créé:', {
    username: cleanUsername,
    phoneNumber: cleanNumber,
    email: cleanEmail
  });
  
  return { success: true, message: 'Compte créé avec succès !', user };
}

// Récupérer l'utilisateur actuel
export function getCurrentUser(): User | null {
  const userData = localStorage.getItem(STORAGE_KEY);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as User;
  } catch {
    return null;
  }
}

// Connexion (gère joueurs ET revendeurs)
export function loginUser(phoneNumber: string, password: string): { success: boolean; role?: 'player' | 'reseller' } {
  // Nettoyer le numéro (enlever le +)
  const cleanNumber = phoneNumber.replace(/\+/g, '');
  
  // Vérifier si c'est un email ou un numéro de téléphone
  const isEmail = phoneNumber.includes('@');
  
  // Rechercher d'abord dans tous les joueurs
  const allPlayers = getAllPlayers();
  const playerFound = allPlayers.find(p => {
    if (isEmail) {
      return p.email === phoneNumber && p.password === hashPassword(password) && p.role === 'player';
    } else {
      return p.phoneNumber === cleanNumber && p.password === hashPassword(password) && p.role === 'player';
    }
  });
  
  if (playerFound) {
    playerFound.isLoggedIn = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerFound));
    return { success: true, role: 'player' };
  }
  
  // Essayer de se connecter comme revendeur
  const allResellers = getAllResellers();
  console.log('[LOGIN] Recherche revendeur - Identifiant:', isEmail ? phoneNumber : cleanNumber);
  console.log('[LOGIN] Nombre de revendeurs:', allResellers.length);
  console.log('[LOGIN] Revendeurs disponibles:', allResellers.map(r => ({ 
    username: r.username, 
    phone: r.phoneNumber,
    email: r.email,
    status: r.status 
  })));
  
  const resellerIndex = allResellers.findIndex(r => {
    if (isEmail) {
      // Connexion par email
      return r.email === phoneNumber && r.password === hashPassword(password);
    } else {
      // Connexion par téléphone
      return r.phoneNumber === cleanNumber && r.password === hashPassword(password);
    }
  });
  
  console.log('[LOGIN] Index trouvé:', resellerIndex);
  
  if (resellerIndex !== -1) {
    const reseller = { ...allResellers[resellerIndex] };
    console.log('[LOGIN] Revendeur trouvé:', reseller.username, 'Status:', reseller.status);
    
    // Vérifier si le compte est suspendu
    if (reseller.status === 'suspended') {
      console.log('[LOGIN] ❌ Compte suspendu');
      return { success: false };
    }
    
    // Connecter le revendeur
    reseller.isLoggedIn = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reseller));
    console.log('[LOGIN] ✅ Connexion réussie en tant que revendeur');
    return { success: true, role: 'reseller' };
  }
  
  console.log('[LOGIN] ❌ Aucun utilisateur trouvé avec ces identifiants');
  return { success: false };
}

// Déconnexion
export function logoutUser(): void {
  const user = getCurrentUser();
  if (user) {
    user.isLoggedIn = false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
}

// Vérifier si l'utilisateur est connecté
export function isUserLoggedIn(): boolean {
  const user = getCurrentUser();
  return user !== null && user.isLoggedIn === true;
}

// Mettre à jour le solde de jeu
export function updateGameBalance(amount: number): void {
  const user = getCurrentUser();
  if (user) {
    user.balanceGame += amount;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    // Si c'est un joueur, synchroniser avec la liste globale
    if (user.role === 'player') {
      addOrUpdatePlayerInList(user);
    }
  }
}

// Mettre à jour le solde des gains
export function updateWinningsBalance(amount: number): void {
  const user = getCurrentUser();
  if (user) {
    user.balanceWinnings += amount;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    // Si c'est un joueur, synchroniser avec la liste globale
    if (user.role === 'player') {
      addOrUpdatePlayerInList(user);
    }
  }
}

// Convertir les gains vers le solde de jeu
export function convertWinningsToGame(amount: number): boolean {
  const user = getCurrentUser();
  if (!user || user.balanceWinnings < amount) return false;
  
  user.balanceWinnings -= amount;
  user.balanceGame += amount;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  
  // Si c'est un joueur, synchroniser avec la liste globale
  if (user.role === 'player') {
    addOrUpdatePlayerInList(user);
  }
  
  return true;
}

// Déduire le coût d'un pari
export function deductBetCost(amount: number): boolean {
  const user = getCurrentUser();
  if (!user || user.balanceGame < amount) return false;
  
  user.balanceGame -= amount;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  
  // Si c'est un joueur, synchroniser avec la liste globale
  if (user.role === 'player') {
    addOrUpdatePlayerInList(user);
  }
  
  return true;
}

// Simuler un gain (pour tests)
export function simulateWin(amount: number): void {
  updateWinningsBalance(amount);
}

// Changer le mot de passe
export function changePassword(oldPassword: string, newPassword: string): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Vérifier l'ancien mot de passe
  if (user.password !== hashPassword(oldPassword)) {
    return false;
  }
  
  // Mettre à jour avec le nouveau mot de passe
  user.password = hashPassword(newPassword);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  
  // Synchroniser avec la liste globale selon le rôle
  if (user.role === 'player') {
    addOrUpdatePlayerInList(user);
  } else if (user.role === 'reseller') {
    addOrUpdateResellerInList(user);
  }
  
  return true;
}

// Mettre à jour le profil utilisateur
export function updateUserProfile(updates: Partial<User>): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Ne pas permettre de modifier certains champs critiques
  const { password, isLoggedIn, ...allowedUpdates } = updates;
  
  const updatedUser = { ...user, ...allowedUpdates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  
  return true;
}

// ===== GESTION DE L'HISTORIQUE DES TRANSACTIONS JOUEURS =====

// Ajouter une transaction à l'historique d'un joueur
export function addPlayerTransaction(
  transaction: Omit<PlayerTransaction, 'id' | 'date'>
): void {
  const user = getCurrentUser();
  if (!user || user.role !== 'player') return;
  
  // Initialiser l'historique si nécessaire
  if (!user.playerTransactionHistory) {
    user.playerTransactionHistory = [];
  }
  
  // Créer la transaction complète
  const fullTransaction: PlayerTransaction = {
    ...transaction,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
  };
  
  // Ajouter au début de l'historique (plus récent en premier)
  user.playerTransactionHistory.unshift(fullTransaction);
  
  // Limiter à 100 transactions pour économiser l'espace
  if (user.playerTransactionHistory.length > 100) {
    user.playerTransactionHistory = user.playerTransactionHistory.slice(0, 100);
  }
  
  // Sauvegarder
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  addOrUpdatePlayerInList(user);
}

// Récupérer l'historique d'un joueur
export function getPlayerTransactionHistory(): PlayerTransaction[] {
  const user = getCurrentUser();
  if (!user || user.role !== 'player') return [];
  return user.playerTransactionHistory || [];
}

// Effacer l'historique d'un joueur
export function clearPlayerTransactionHistory(): void {
  const user = getCurrentUser();
  if (!user || user.role !== 'player') return;
  
  user.playerTransactionHistory = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  addOrUpdatePlayerInList(user);
}

// ===== FONCTIONS SPÉCIFIQUES AUX REVENDEURS =====

// Rechercher un joueur par numéro ou username (RÉEL)
export function searchPlayer(searchTerm: string): User | null {
  // Nettoyer le terme de recherche
  const cleanTerm = searchTerm.trim().replace(/\+/g, '');
  
  // Récupérer tous les joueurs
  const allPlayers = getAllPlayers();
  
  // Rechercher par numéro ou username
  const player = allPlayers.find(p => 
    p.role === 'player' && (
      p.phoneNumber === cleanTerm ||
      p.phoneNumber.includes(cleanTerm) ||
      p.username.toLowerCase() === cleanTerm.toLowerCase() ||
      p.username.toLowerCase().includes(cleanTerm.toLowerCase())
    )
  );
  
  return player || null;
}

// Créditer le compte d'un joueur (fonction revendeur) - VERSION RÉELLE
export function creditPlayerAccount(
  searchTerm: string,
  amount: number
): { success: boolean; message: string } {
  const reseller = getCurrentUser();
  
  // Vérifier que c'est bien un revendeur
  if (!reseller || reseller.role !== 'reseller') {
    return { success: false, message: 'Non autorisé' };
  }
  
  // Vérifier que le revendeur a assez de jetons
  if (!reseller.tokenBalance || reseller.tokenBalance < amount) {
    return { success: false, message: 'Solde de jetons insuffisant' };
  }
  
  // Rechercher le joueur RÉEL
  const player = searchPlayer(searchTerm);
  
  if (!player) {
    return { success: false, message: 'Joueur introuvable. Vérifiez le numéro ou le username.' };
  }
  
  // Créditer le compte du joueur
  player.balanceGame += amount;
  
  // ✅ NOUVEAU : Ajouter une transaction dans l'historique du joueur
  if (!player.playerTransactionHistory) {
    player.playerTransactionHistory = [];
  }
  player.playerTransactionHistory.unshift({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: 'RECHARGE',
    description: `Rechargement par ${reseller.username}`,
    amount: amount,
    balanceAfter: player.balanceGame,
    date: new Date().toISOString(),
    metadata: {
      resellerName: reseller.username,
    },
  });
  
  // Limiter l'historique du joueur
  if (player.playerTransactionHistory.length > 100) {
    player.playerTransactionHistory = player.playerTransactionHistory.slice(0, 100);
  }
  
  // Mettre à jour dans la liste globale
  const allPlayers = getAllPlayers();
  const playerIndex = allPlayers.findIndex(p => p.phoneNumber === player.phoneNumber);
  if (playerIndex !== -1) {
    allPlayers[playerIndex] = player;
    saveAllPlayers(allPlayers);
  }
  
  // Si c'est l'utilisateur connecté actuellement, mettre à jour aussi
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.phoneNumber === player.phoneNumber && currentUser.role === 'player') {
    currentUser.balanceGame = player.balanceGame;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
  }
  
  // Déduire du solde du revendeur
  reseller.tokenBalance -= amount;
  reseller.dailyRechargeTotal = (reseller.dailyRechargeTotal || 0) + amount;
  reseller.dailyTransactionsCount = (reseller.dailyTransactionsCount || 0) + 1;
  
  // Ajouter à l'historique
  if (!reseller.transactionHistory) reseller.transactionHistory = [];
  reseller.transactionHistory.unshift({
    id: Date.now().toString(),
    playerNumber: player.phoneNumber,
    playerUsername: player.username,
    amount: amount,
    date: new Date().toISOString(),
  });
  
  // Sauvegarder le revendeur dans la session actuelle
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reseller));
  
  // ✅ NOUVEAU : Synchroniser avec la liste globale des revendeurs
  addOrUpdateResellerInList(reseller);
  
  return { 
    success: true, 
    message: `✅ Le compte de ${player.username} a été crédité de ${amount.toLocaleString('fr-FR')} F CFA` 
  };
}

// ===== FONCTIONS POUR GOOGLE AUTH =====

// Créer un nouvel utilisateur avec Google Auth
export function createUserWithGoogle(
  email: string,
  username: string,
  phoneNumber: string
): { success: boolean; message: string; user?: User } {
  // Nettoyer les données
  const cleanNumber = phoneNumber.replace(/\+/g, '');
  const cleanUsername = username.trim();
  const cleanEmail = email.toLowerCase().trim();
  
  // ✅ VALIDATION 1: Vérifier si l'email existe déjà
  const existingEmailUser = userExistsWithEmail(cleanEmail);
  if (existingEmailUser) {
    // Si l'email existe déjà, l'utilisateur devrait se connecter
    return {
      success: false,
      message: 'Un compte existe déjà avec cette adresse email Google. Connectez-vous avec Google.'
    };
  }
  
  // ✅ VALIDATION 2: Vérifier si le numéro de téléphone existe déjà
  if (userExistsWithPhone(cleanNumber)) {
    return {
      success: false,
      message: 'Ce numéro de téléphone est déjà utilisé par un autre compte.'
    };
  }
  
  // ✅ VALIDATION 3: Vérifier si le username existe déjà
  if (userExistsWithUsername(cleanUsername)) {
    return {
      success: false,
      message: 'Ce nom d\'utilisateur est déjà pris. Veuillez en choisir un autre.'
    };
  }
  
  // Créer l'utilisateur
  const user: User = {
    id: generateUserId(),
    isLoggedIn: true,
    username: cleanUsername,
    email: cleanEmail,
    phoneNumber: cleanNumber,
    password: hashPassword('google_auth_' + cleanEmail), // Mot de passe auto-généré
    authMethod: 'google',
    role: 'player',
    balanceGame: 1000, // Solde initial de bienvenue
    balanceWinnings: 0,
    playerTransactionHistory: [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type: 'RECHARGE',
        description: 'Bonus de bienvenue Google',
        amount: 1000,
        balanceAfter: 1000,
        date: new Date().toISOString(),
      }
    ],
    status: 'active',
  };
  
  // Sauvegarder comme utilisateur actuel
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  
  // Ajouter à la liste globale
  addOrUpdatePlayerInList(user);
  
  console.log('✅ Nouveau joueur créé avec Google:', {
    username: cleanUsername,
    phoneNumber: cleanNumber,
    email: cleanEmail
  });
  
  return { success: true, message: 'Compte créé avec succès !', user };
}

// Connecter un utilisateur avec Google Auth (email existant)
export function loginUserWithGoogle(email: string): boolean {
  const existingUser = userExistsWithEmail(email);
  
  // Vérifier que c'est bien un User (pas un AdminUser) et que c'est un joueur
  if (!existingUser || !('role' in existingUser) || existingUser.role !== 'player') {
    return false;
  }
  
  const player = existingUser as User;
  player.isLoggedIn = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(player));
  
  // Synchroniser avec la liste globale
  addOrUpdatePlayerInList(player);
  
  return true;
}

// ===== RETRAIT D'ARGENT VIA MOBILE MONEY =====

// Retirer de l'argent du solde de jeu vers Mobile Money
export function withdrawMoney(
  amount: number,
  provider: string,
  phoneNumber: string
): { success: boolean; message: string } {
  const user = getCurrentUser();
  
  // Vérifier que c'est bien un joueur
  if (!user || user.role !== 'player') {
    return { success: false, message: 'Non autorisé' };
  }
  
  // Vérifier le montant minimum
  if (amount < 500) {
    return { success: false, message: 'Le montant minimum de retrait est 500 F CFA' };
  }
  
  // Vérifier le solde
  if (user.balanceGame < amount) {
    return { success: false, message: 'Solde insuffisant' };
  }
  
  // Déduire du solde de jeu
  user.balanceGame -= amount;
  
  // Initialiser l'historique si nécessaire
  if (!user.playerTransactionHistory) {
    user.playerTransactionHistory = [];
  }
  
  // Créer la transaction directement
  const transaction: PlayerTransaction = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    date: new Date().toISOString(),
    type: 'WITHDRAWAL',
    description: `Retrait via ${getProviderName(provider)}`,
    amount: -amount, // Négatif car c'est une sortie
    balanceAfter: user.balanceGame,
    metadata: {
      provider: provider,
      phoneNumber: phoneNumber,
    },
  };
  
  // Ajouter au début de l'historique (plus récent en premier)
  user.playerTransactionHistory.unshift(transaction);
  
  // Limiter à 100 transactions pour économiser l'espace
  if (user.playerTransactionHistory.length > 100) {
    user.playerTransactionHistory = user.playerTransactionHistory.slice(0, 100);
  }
  
  // Sauvegarder
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  addOrUpdatePlayerInList(user);
  
  // IMPORTANT : Créer une demande de retrait pour l'admin
  const withdrawalRequest: WithdrawalRequest = {
    id: `withdrawal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    username: user.username,
    phoneNumber: user.phoneNumber,
    amount,
    provider,
    withdrawalPhoneNumber: phoneNumber,
    status: 'pending',
    requestDate: new Date().toISOString(),
  };
  
  // Sauvegarder la demande dans localStorage
  const requests = getWithdrawalRequests();
  requests.unshift(withdrawalRequest);
  localStorage.setItem(WITHDRAWAL_REQUESTS_KEY, JSON.stringify(requests));
  
  return {
    success: true,
    message: `✅ Demande de retrait de ${amount.toLocaleString('fr-FR')} F CFA envoyée ! Elle sera traitée sous peu.`
  };
}

// Récupérer toutes les demandes de retrait
function getWithdrawalRequests(): WithdrawalRequest[] {
  const stored = localStorage.getItem(WITHDRAWAL_REQUESTS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// Exporter la fonction pour l'admin
export function getAllWithdrawalRequests(): WithdrawalRequest[] {
  return getWithdrawalRequests();
}

// Approuver une demande de retrait (admin)
export function approveWithdrawalRequest(requestId: string): boolean {
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index !== -1) {
    requests[index].status = 'approved';
    requests[index].processedDate = new Date().toISOString();
    localStorage.setItem(WITHDRAWAL_REQUESTS_KEY, JSON.stringify(requests));
    return true;
  }
  
  return false;
}

// Rejeter une demande de retrait (admin)
export function rejectWithdrawalRequest(requestId: string): boolean {
  const requests = getWithdrawalRequests();
  const index = requests.findIndex(r => r.id === requestId);
  
  if (index !== -1) {
    requests[index].status = 'rejected';
    requests[index].processedDate = new Date().toISOString();
    localStorage.setItem(WITHDRAWAL_REQUESTS_KEY, JSON.stringify(requests));
    return true;
  }
  
  return false;
}

// Obtenir le nom complet du provider
function getProviderName(providerId: string): string {
  const operator = MOBILE_MONEY_OPERATORS.find(op => op.id === providerId);
  return operator ? operator.name : providerId;
}

// ===== FONCTIONS ADMIN =====

// Constantes admin
const ADMIN_PHONE = '000000000000';
const ADMIN_PASSWORD = 'adminlotto';

// Vérifier si les identifiants correspondent à un admin (email ou numéro)
export function isAdminCredentials(phoneOrEmail: string, password: string): boolean {
  const cleanNumber = phoneOrEmail.replace(/[\\s\\-\\.+]/g, '');
  // Test 1: Vérifier l'admin par défaut avec numéro de téléphone
  const isDefaultAdmin = cleanNumber === ADMIN_PHONE || cleanNumber.endsWith(ADMIN_PHONE);
  if (isDefaultAdmin && password === ADMIN_PASSWORD) {
    return true;
  }
  
  // Test 2: Vérifier contre la base de données des admins (par email)
  const admins = getAllAdmins();
  console.log('[AUTH DEBUG] Admins disponibles:', admins.map(a => ({ email: a.email, status: a.status })));
  
  const admin = admins.find(a => a.email.toLowerCase() === phoneOrEmail.toLowerCase());
  
  if (admin) {
    console.log('[AUTH DEBUG] Admin trouvé:', admin.email, 'Status:', admin.status);
    
    // Vérifier que l'admin est actif
    if (admin.status === 'Désactivé') {
      console.log('[AUTH DEBUG] ❌ Admin désactivé');
      return false;
    }
    
    // Vérifier le mot de passe (comparer le hash)
    const enteredHash = hashPassword(password);
    const isMatch = enteredHash === admin.password;
    console.log('[AUTH DEBUG] Hash match:', isMatch);
    
    return isMatch;
  }
  
  console.log('[AUTH DEBUG] ❌ Aucun admin trouvé avec:', phoneOrEmail);
  return false;
}

// Connecter en tant qu'admin
export function loginAsAdmin(emailOrPhone?: string): User {
  let adminUsername = 'Super Admin';
  let adminEmail = 'admin@lottohappy.com';
  
  // Si un email/phone est fourni, chercher l'admin correspondant
  if (emailOrPhone) {
    const admins = getAllAdmins();
    const admin = admins.find(a => 
      a.email.toLowerCase() === emailOrPhone.toLowerCase()
    );
    
    if (admin) {
      adminUsername = admin.username;
      adminEmail = admin.email;
      
      // Mettre à jour la dernière connexion
      updateAdminLastLogin(admin.email);
    }
  }
  
  const adminUser: User = {
    id: generateUserId(),
    isLoggedIn: true,
    username: adminUsername,
    phoneNumber: ADMIN_PHONE,
    email: adminEmail,
    password: hashPassword(ADMIN_PASSWORD),
    authMethod: 'password',
    role: 'admin',
    balanceGame: 0,
    balanceWinnings: 0,
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
  return adminUser;
}

// Suspendre/Réactiver un compte utilisateur
export function toggleUserStatus(phoneNumber: string): boolean {
  const allPlayers = getAllPlayers();
  const playerIndex = allPlayers.findIndex(p => p.phoneNumber === phoneNumber);
  
  if (playerIndex !== -1) {
    const currentStatus = allPlayers[playerIndex].status || 'active';
    allPlayers[playerIndex].status = currentStatus === 'active' ? 'suspended' : 'active';
    saveAllPlayers(allPlayers);
    return true;
  }
  
  const allResellers = getAllResellers();
  const resellerIndex = allResellers.findIndex(r => r.phoneNumber === phoneNumber);
  
  if (resellerIndex !== -1) {
    const currentStatus = allResellers[resellerIndex].status || 'active';
    allResellers[resellerIndex].status = currentStatus === 'active' ? 'suspended' : 'active';
    saveAllResellers(allResellers);
    return true;
  }
  
  return false;
}

// Créditer/Débiter un solde (admin)
export function adminAdjustBalance(
  phoneNumber: string,
  amount: number,
  balanceType: 'game' | 'winnings' | 'token',
  reason: string
): boolean {
  const allPlayers = getAllPlayers();
  const playerIndex = allPlayers.findIndex(p => p.phoneNumber === phoneNumber);
  
  if (playerIndex !== -1) {
    if (balanceType === 'game') {
      allPlayers[playerIndex].balanceGame += amount;
    } else if (balanceType === 'winnings') {
      allPlayers[playerIndex].balanceWinnings += amount;
    }
    saveAllPlayers(allPlayers);
    return true;
  }
  
  const allResellers = getAllResellers();
  const resellerIndex = allResellers.findIndex(r => r.phoneNumber === phoneNumber);
  
  if (resellerIndex !== -1 && balanceType === 'token') {
    allResellers[resellerIndex].tokenBalance = (allResellers[resellerIndex].tokenBalance || 0) + amount;
    saveAllResellers(allResellers);
    return true;
  }
  
  return false;
}

// ===== GESTION DES ADMINISTRATEURS =====

// Fonction pour créer l'admin par défaut
function createDefaultAdmins(): AdminUser[] {
  return [
    {
      id: generateUserId(),
      username: 'Super Admin',
      email: 'admin@lottohappy.com',
      password: hashPassword('adminlotto'),
      role: 'Super Admin',
      status: 'Actif',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    },
  ];
}

// Récupérer tous les administrateurs
export function getAllAdmins(): AdminUser[] {
  const adminsData = localStorage.getItem(ADMIN_USERS_KEY);
  if (!adminsData) {
    // Premier chargement : initialiser avec le Super Admin par défaut
    const defaultAdmins = createDefaultAdmins();
    saveAllAdmins(defaultAdmins);
    return defaultAdmins;
  }
  
  try {
    return JSON.parse(adminsData) as AdminUser[];
  } catch {
    // En cas d'erreur, réinitialiser avec les valeurs par défaut
    const defaultAdmins = createDefaultAdmins();
    saveAllAdmins(defaultAdmins);
    return defaultAdmins;
  }
}

// Sauvegarder tous les administrateurs
function saveAllAdmins(admins: AdminUser[]): void {
  localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(admins));
}

// Créer un nouvel administrateur
export function createAdmin(
  username: string,
  email: string,
  password: string,
  role: 'Super Admin' | 'Admin Financier' | 'Admin du Jeu' | 'Support Client'
): { success: boolean; message: string; admin?: AdminUser } {
  const admins = getAllAdmins();
  
  // Vérifier si l'email existe déjà
  if (admins.some(a => a.email === email)) {
    return { success: false, message: 'Cet email est déjà utilisé' };
  }
  
  const newAdmin: AdminUser = {
    id: generateUserId(),
    username,
    email,
    password: hashPassword(password),
    role,
    status: 'Actif',
    lastLogin: 'Jamais connecté',
    createdAt: new Date().toISOString(),
  };
  
  admins.push(newAdmin);
  saveAllAdmins(admins);
  
  return { success: true, message: 'Administrateur créé avec succès', admin: newAdmin };
}

// Mettre à jour un administrateur
export function updateAdmin(
  adminId: string,
  updates: Partial<AdminUser>
): { success: boolean; message: string } {
  const admins = getAllAdmins();
  const adminIndex = admins.findIndex(a => a.id === adminId);
  
  if (adminIndex === -1) {
    return { success: false, message: 'Administrateur non trouvé' };
  }
  
  // Vérifier si l'email est changé et s'il existe déjà
  if (updates.email && updates.email !== admins[adminIndex].email) {
    if (admins.some(a => a.email === updates.email && a.id !== adminId)) {
      return { success: false, message: 'Cet email est déjà utilisé' };
    }
  }
  
  // Appliquer les mises à jour
  admins[adminIndex] = { ...admins[adminIndex], ...updates };
  saveAllAdmins(admins);
  
  return { success: true, message: 'Administrateur mis à jour avec succès' };
}

// Suspendre/Réactiver un administrateur
export function toggleAdminStatus(adminId: string): { success: boolean; message: string } {
  const admins = getAllAdmins();
  const adminIndex = admins.findIndex(a => a.id === adminId);
  
  if (adminIndex === -1) {
    return { success: false, message: 'Administrateur non trouvé' };
  }
  
  // Empêcher la suspension du dernier Super Admin actif
  if (admins[adminIndex].role === 'Super Admin' && admins[adminIndex].status === 'Actif') {
    const activeSuperAdmins = admins.filter(a => a.role === 'Super Admin' && a.status === 'Actif');
    if (activeSuperAdmins.length === 1) {
      return { success: false, message: 'Impossible de désactiver le dernier Super Admin actif' };
    }
  }
  
  admins[adminIndex].status = admins[adminIndex].status === 'Actif' ? 'Désactivé' : 'Actif';
  saveAllAdmins(admins);
  
  const action = admins[adminIndex].status === 'Actif' ? 'réactivé' : 'désactivé';
  return { success: true, message: `Administrateur ${action} avec succès` };
}

// Supprimer un administrateur
export function deleteAdmin(adminId: string): { success: boolean; message: string } {
  const admins = getAllAdmins();
  const adminIndex = admins.findIndex(a => a.id === adminId);
  
  if (adminIndex === -1) {
    return { success: false, message: 'Administrateur non trouvé' };
  }
  
  // Empêcher la suppression du dernier Super Admin
  if (admins[adminIndex].role === 'Super Admin') {
    const superAdmins = admins.filter(a => a.role === 'Super Admin');
    if (superAdmins.length === 1) {
      return { success: false, message: 'Impossible de supprimer le dernier Super Admin' };
    }
  }
  
  admins.splice(adminIndex, 1);
  saveAllAdmins(admins);
  
  return { success: true, message: 'Administrateur supprimé avec succès' };
}

// Mettre à jour la dernière connexion d'un admin
export function updateAdminLastLogin(email: string): void {
  const admins = getAllAdmins();
  const adminIndex = admins.findIndex(a => a.email === email);
  
  if (adminIndex !== -1) {
    admins[adminIndex].lastLogin = new Date().toISOString();
    saveAllAdmins(admins);
  }
}

// Récupérer le rôle admin de l'utilisateur actuel
export function getCurrentAdminRole(): 'Super Admin' | 'Admin Financier' | 'Admin du Jeu' | 'Support Client' | null {
  const currentUser = getCurrentUser();
  
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }
  
  // Pour le moment, le système simple retourne toujours Super Admin
  // Dans une version avancée, on stockerait le rôle spécifique dans User
  const admins = getAllAdmins();
  const admin = admins.find(a => a.email === currentUser.email);
  
  return admin ? admin.role : 'Super Admin';
}

// Initialiser les administrateurs au démarrage
export function initializeAdmins(): void {
  getAllAdmins();
}