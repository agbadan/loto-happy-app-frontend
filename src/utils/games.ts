// ===== CONFIGURATION DES OPÉRATEURS DE LOTERIE =====
// Un opérateur = Une société de loterie (ex: Lotto Kadoo, Bénin Lotto)
// Les admins créent des TIRAGES pour ces opérateurs
// Les joueurs choisissent leur TYPE DE PARI (NAP2, NAP5, etc.) pour un tirage

export type BetType = 
  | 'NAP1'          // Simple numéro
  | 'NAP2'          // Deux numéros (Two Sure)
  | 'NAP3'          // Trois numéros
  | 'NAP4'          // Quatre numéros
  | 'NAP5'          // Cinq numéros
  | 'PERMUTATION'   // Combinaisons automatiques
  | 'BANKA'         // Numéro de base + autres
  | 'CHANCE_PLUS'   // Position exacte (premier/dernier)
  | 'ANAGRAMME';    // Numéros inversés (12/21)

export interface BetTypeConfig {
  id: BetType;
  name: string;
  description: string;
  minNumbers: number;
  maxNumbers: number;
  requiresPosition?: boolean; // Pour CHANCE_PLUS
  requiresBase?: boolean; // Pour BANKA
  autoGeneratesCombinations?: boolean; // Pour PERMUTATION
  defaultMultiplier: number; // Multiplicateur par défaut
  icon: string;
}

// ===== OPÉRATEUR =====
export interface Operator {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  icon: string;
  color: string;
  // Configuration des tirages pour cet opérateur
  numbersPool: number; // Pool de numéros disponibles (ex: 1-90)
  numbersDrawn: number; // Combien de numéros sont tirés (toujours 5)
  minBet: number;
  maxBet: number;
}

// ===== TIRAGE (Draw) =====
// Créé par l'admin dans AdminGames
export interface Draw {
  id: string;
  operatorId: string; // Référence à l'opérateur
  date: string; // Format ISO: "2025-10-29"
  time: string; // Format: "10:39"
  
  // Multiplicateurs spécifiques à ce tirage (définis par l'admin)
  multipliers: {
    [K in BetType]?: number;
  };
  
  // Statut et résultats
  status: 'upcoming' | 'pending' | 'completed';
  winningNumbers: number[]; // Les 5 numéros tirés (vide jusqu'au tirage)
  
  // Métadonnées
  createdAt: string;
  createdBy: string; // ID de l'admin qui a créé le tirage
}

// ===== CONFIGURATION DES 5 OPÉRATEURS =====

export const OPERATORS_CONFIG: Operator[] = [
  {
    id: 'togo-kadoo',
    name: 'Lotto Kadoo',
    country: 'Togo',
    countryCode: '+228',
    icon: '🎯',
    color: '#FFD700',
    numbersPool: 90,
    numbersDrawn: 5,
    minBet: 100,
    maxBet: 50000
  },
  {
    id: 'benin-lotto',
    name: 'Bénin Lotto',
    country: 'Bénin',
    countryCode: '+229',
    icon: '🇧🇯',
    color: '#FF6B00',
    numbersPool: 90,
    numbersDrawn: 5,
    minBet: 100,
    maxBet: 50000
  },
  {
    id: 'ivoire-lonaci',
    name: 'Lonaci',
    country: 'Côte d\'Ivoire',
    countryCode: '+225',
    icon: '🇨🇮',
    color: '#4F00BC',
    numbersPool: 90,
    numbersDrawn: 5,
    minBet: 100,
    maxBet: 50000
  },
  {
    id: 'nigeria-greenlotto',
    name: 'Green Lotto',
    country: 'Nigeria',
    countryCode: '+234',
    icon: '🇳🇬',
    color: '#009DD9',
    numbersPool: 90,
    numbersDrawn: 5,
    minBet: 100,
    maxBet: 50000
  },
  {
    id: 'senegal-pmu',
    name: 'PMU Sénégal',
    country: 'Sénégal',
    countryCode: '+221',
    icon: '🇸🇳',
    color: '#00A651',
    numbersPool: 90,
    numbersDrawn: 5,
    minBet: 100,
    maxBet: 50000
  }
];

// ===== CONFIGURATIONS DES TYPES DE PARIS =====

export const BET_TYPES_CONFIG: { [key in BetType]: BetTypeConfig } = {
  NAP1: {
    id: 'NAP1',
    name: 'Simple Numéro (NAP1)',
    description: 'Trouvez 1 numéro parmi les 5 tirés',
    minNumbers: 1,
    maxNumbers: 1,
    defaultMultiplier: 10, // x10 la mise
    icon: '🎯'
  },
  NAP2: {
    id: 'NAP2',
    name: 'Deux Numéros (NAP2 / Two Sure)',
    description: 'Trouvez 2 numéros parmi les 5 tirés',
    minNumbers: 2,
    maxNumbers: 2,
    defaultMultiplier: 500, // x500 la mise
    icon: '🎲'
  },
  NAP3: {
    id: 'NAP3',
    name: 'Trois Numéros (NAP3)',
    description: 'Trouvez 3 numéros parmi les 5 tirés',
    minNumbers: 3,
    maxNumbers: 3,
    defaultMultiplier: 2500, // x2500 la mise
    icon: '🔮'
  },
  NAP4: {
    id: 'NAP4',
    name: 'Quatre Numéros (NAP4)',
    description: 'Trouvez 4 numéros parmi les 5 tirés',
    minNumbers: 4,
    maxNumbers: 4,
    defaultMultiplier: 10000, // x10000 la mise
    icon: '💎'
  },
  NAP5: {
    id: 'NAP5',
    name: 'Cinq Numéros (NAP5 / Perm Nap)',
    description: 'Trouvez les 5 numéros tirés',
    minNumbers: 5,
    maxNumbers: 5,
    defaultMultiplier: 100000, // x100000 la mise - JACKPOT !
    icon: '👑'
  },
  PERMUTATION: {
    id: 'PERMUTATION',
    name: 'Combinaison (Permutation)',
    description: 'Sélectionnez plusieurs numéros, on génère toutes les combinaisons NAP2',
    minNumbers: 3,
    maxNumbers: 10,
    autoGeneratesCombinations: true,
    defaultMultiplier: 500, // Chaque combinaison x500
    icon: '🔄'
  },
  BANKA: {
    id: 'BANKA',
    name: 'Numéro de Base (Against / Banka)',
    description: 'Un numéro de base + d\'autres numéros associés',
    minNumbers: 2, // 1 base + au moins 1 autre
    maxNumbers: 11, // 1 base + max 10 autres
    requiresBase: true,
    defaultMultiplier: 500,
    icon: '⭐'
  },
  CHANCE_PLUS: {
    id: 'CHANCE_PLUS',
    name: 'Position Exacte (Chance+)',
    description: 'Trouvez le numéro en première ou dernière position',
    minNumbers: 1,
    maxNumbers: 1,
    requiresPosition: true,
    defaultMultiplier: 90, // x90 la mise (1 chance sur 90)
    icon: '🎰'
  },
  ANAGRAMME: {
    id: 'ANAGRAMME',
    name: 'Numéros Inversés (Anagramme / WE dans WE)',
    description: 'Pariez sur un numéro ET son inversé (ex: 12 et 21)',
    minNumbers: 1,
    maxNumbers: 1,
    defaultMultiplier: 10, // x10 la mise (couvre 2 numéros)
    icon: '🔃'
  }
};

// ===== FONCTIONS UTILITAIRES - OPÉRATEURS =====

export function getOperatorById(operatorId: string): Operator | undefined {
  return OPERATORS_CONFIG.find(op => op.id === operatorId);
}

export function getAllOperators(): Operator[] {
  return OPERATORS_CONFIG;
}

export function getOperatorsByCountry(country: string): Operator[] {
  return OPERATORS_CONFIG.filter(op => op.country === country);
}

export function getAllCountries(): string[] {
  return Array.from(new Set(OPERATORS_CONFIG.map(op => op.country)));
}

// ===== FONCTIONS UTILITAIRES - TYPES DE PARIS =====

export function getAvailableBetTypes(): BetType[] {
  return Object.keys(BET_TYPES_CONFIG) as BetType[];
}

export function getBetTypeConfig(betType: BetType): BetTypeConfig {
  return BET_TYPES_CONFIG[betType];
}

// Calculer le nombre de combinaisons pour PERMUTATION
export function calculatePermutationCombinations(totalNumbers: number): number {
  // Combinaisons de 2 parmi N : C(n,2) = n! / (2! * (n-2)!)
  // Formule simplifiée : n * (n-1) / 2
  return (totalNumbers * (totalNumbers - 1)) / 2;
}

// Calculer le coût total d'un pari PERMUTATION
export function calculatePermutationCost(totalNumbers: number, betPerCombination: number): number {
  const combinations = calculatePermutationCombinations(totalNumbers);
  return combinations * betPerCombination;
}

// Générer toutes les combinaisons NAP2 pour PERMUTATION
export function generateNAP2Combinations(numbers: number[]): number[][] {
  const combinations: number[][] = [];
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      combinations.push([numbers[i], numbers[j]]);
    }
  }
  return combinations;
}

// Inverser un numéro (pour ANAGRAMME)
export function invertNumber(num: number): number | null {
  const str = num.toString();
  if (str.length === 1) return null; // Pas d'inversé pour les nombres à 1 chiffre
  const inverted = parseInt(str.split('').reverse().join(''));
  return inverted <= 90 ? inverted : null; // Valide seulement si <= 90
}

// ===== FONCTIONS UTILITAIRES - TIRAGES =====

// Obtenir les tirages à venir pour un opérateur
export function getUpcomingDrawsForOperator(operatorId: string): Draw[] {
  const draws = getDrawsFromLocalStorage();
  const now = new Date();
  
  return draws.filter(draw => {
    if (draw.operatorId !== operatorId) return false;
    if (draw.status !== 'upcoming') return false;
    
    const drawDateTime = new Date(`${draw.date}T${draw.time}`);
    return drawDateTime > now;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
}

// Obtenir tous les tirages à venir
export function getAllUpcomingDraws(): Draw[] {
  const draws = getDrawsFromLocalStorage();
  const now = new Date();
  
  return draws.filter(draw => {
    if (draw.status !== 'upcoming') return false;
    
    const drawDateTime = new Date(`${draw.date}T${draw.time}`);
    return drawDateTime > now;
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
}

// Obtenir un tirage par ID
export function getDrawById(drawId: string): Draw | undefined {
  const draws = getDrawsFromLocalStorage();
  // Gérer les deux cas: string et number (pour compatibilité avec anciens tirages)
  return draws.find(d => String(d.id) === String(drawId));
}

// Sauvegarder les tirages dans localStorage
export function saveDrawsToLocalStorage(draws: Draw[]): void {
  localStorage.setItem('loto_happy_draws', JSON.stringify(draws));
}

// Charger les tirages depuis localStorage
export function getDrawsFromLocalStorage(): Draw[] {
  try {
    const data = localStorage.getItem('loto_happy_draws');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des tirages:', error);
    return [];
  }
}

// Créer un nouveau tirage
export function createDraw(
  operatorId: string,
  date: string,
  time: string,
  multipliers: { [K in BetType]?: number },
  createdBy: string
): Draw {
  const draws = getDrawsFromLocalStorage();
  
  const newDraw: Draw = {
    id: `draw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    operatorId,
    date,
    time,
    multipliers,
    status: 'upcoming',
    winningNumbers: [],
    createdAt: new Date().toISOString(),
    createdBy
  };
  
  draws.push(newDraw);
  saveDrawsToLocalStorage(draws);
  
  return newDraw;
}

// Mettre à jour un tirage
export function updateDraw(drawId: string, updates: Partial<Draw>): Draw | null {
  const draws = getDrawsFromLocalStorage();
  const index = draws.findIndex(d => d.id === drawId);
  
  if (index === -1) return null;
  
  draws[index] = { ...draws[index], ...updates };
  saveDrawsToLocalStorage(draws);
  
  return draws[index];
}

// Supprimer un tirage
export function deleteDraw(drawId: string): boolean {
  const draws = getDrawsFromLocalStorage();
  const filtered = draws.filter(d => d.id !== drawId);
  
  if (filtered.length === draws.length) return false;
  
  saveDrawsToLocalStorage(filtered);
  return true;
}

// Formater l'affichage d'un tirage
export function formatDrawDisplay(draw: Draw): { 
  operatorName: string; 
  country: string;
  fullName: string;
  time: string; 
  countdown: string;
  icon: string;
  color: string;
} {
  const operator = getOperatorById(draw.operatorId);
  if (!operator) {
    return {
      operatorName: 'Opérateur inconnu',
      country: '',
      fullName: 'Opérateur inconnu',
      time: draw.time,
      countdown: '',
      icon: '🎯',
      color: '#FFD700'
    };
  }
  
  const drawDateTime = new Date(`${draw.date}T${draw.time}`);
  const now = new Date();
  const diff = drawDateTime.getTime() - now.getTime();
  
  // Calculer le countdown
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  let countdown = '';
  if (diff < 0) {
    countdown = 'Terminé';
  } else if (hours >= 24) {
    const days = Math.floor(hours / 24);
    countdown = `Dans ${days}j ${hours % 24}h`;
  } else if (hours > 0) {
    countdown = `Dans ${hours}h ${minutes}min`;
  } else {
    countdown = `Dans ${minutes}min`;
  }
  
  return {
    operatorName: operator.name,
    country: operator.country,
    fullName: `${operator.name} (${operator.country})`,
    time: draw.time,
    countdown,
    icon: operator.icon,
    color: operator.color
  };
}

// ===== MULTIPLICATEURS PAR DÉFAUT =====
// Utilisés lors de la création d'un nouveau tirage
export function getDefaultMultipliers(): { [K in BetType]: number } {
  return {
    NAP1: BET_TYPES_CONFIG.NAP1.defaultMultiplier,
    NAP2: BET_TYPES_CONFIG.NAP2.defaultMultiplier,
    NAP3: BET_TYPES_CONFIG.NAP3.defaultMultiplier,
    NAP4: BET_TYPES_CONFIG.NAP4.defaultMultiplier,
    NAP5: BET_TYPES_CONFIG.NAP5.defaultMultiplier,
    PERMUTATION: BET_TYPES_CONFIG.PERMUTATION.defaultMultiplier,
    BANKA: BET_TYPES_CONFIG.BANKA.defaultMultiplier,
    CHANCE_PLUS: BET_TYPES_CONFIG.CHANCE_PLUS.defaultMultiplier,
    ANAGRAMME: BET_TYPES_CONFIG.ANAGRAMME.defaultMultiplier
  };
}
