// src/utils/games.ts

// ===== CONFIGURATION DES OPÉRATEURS DE LOTERIE =====
// Un opérateur = Une société de loterie (ex: Lotto Kadoo, Bénin Lotto)
// Les admins créent des TIRAGES pour ces opérateurs
// Les joueurs choisissent leur TYPE DE PARI (NAP2, NAP5, etc.) pour un tirage

// --- MISE À JOUR ---
// Ajout des types 'SIMPLE' et 'DOUBLE' pour une compatibilité totale
export type BetType = 
  | 'NAP1'
  | 'NAP2'
  | 'NAP3'
  | 'NAP4'
  | 'NAP5'
  | 'PERMUTATION'
  | 'BANKA'
  | 'CHANCE_PLUS'
  | 'ANAGRAMME'
  | 'SIMPLE' // Ajout pour compatibilité
  | 'DOUBLE'; // Ajout pour compatibilité

export interface BetTypeConfig {
  id?: BetType; // Rendu optionnel pour flexibilité
  name: string;
  description?: string; // Rendu optionnel
  minNumbers: number;
  maxNumbers: number;
  requiresPosition?: boolean; // Pour CHANCE_PLUS
  requiresBase?: boolean; // Pour BANKA
  autoGeneratesCombinations?: boolean; // Pour PERMUTATION
  defaultMultiplier: number; // Multiplicateur par défaut
  icon?: string; // Rendu optionnel
}

// ===== OPÉRATEUR =====
export interface Operator {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  icon: string;
  color: string;
  numbersPool: number;
  numbersDrawn: number;
  minBet: number;
  maxBet: number;
}

// ===== TIRAGE (Draw) =====
export interface Draw {
  id: string;
  operatorId: string;
  date: string;
  time: string;
  multipliers: {
    [K in BetType]?: number;
  };
  status: 'upcoming' | 'pending' | 'completed';
  winningNumbers: number[];
  createdAt: string;
  createdBy: string;
}

// ===== CONFIGURATION DES 5 OPÉRATEURS =====
export const OPERATORS_CONFIG: Operator[] = [
  // ... (votre configuration d'opérateurs reste inchangée)
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

// ===== CONFIGURATIONS DES TYPES DE PARIS (FUSIONNÉ ET CORRIGÉ) =====

export const BET_TYPES_CONFIG: { [key in BetType]: BetTypeConfig } = {
  // Types principaux utilisés par le backend
  NAP1: {
    id: 'NAP1', name: 'NAP 1', description: 'Trouvez 1 numéro parmi les 5 tirés',
    minNumbers: 1, maxNumbers: 1, defaultMultiplier: 10, icon: '🎯'
  },
  NAP2: {
    id: 'NAP2', name: 'NAP 2', description: 'Trouvez 2 numéros parmi les 5 tirés',
    minNumbers: 2, maxNumbers: 2, defaultMultiplier: 500, icon: '🎲'
  },
  NAP3: {
    id: 'NAP3', name: 'NAP 3', description: 'Trouvez 3 numéros parmi les 5 tirés',
    minNumbers: 3, maxNumbers: 3, defaultMultiplier: 2500, icon: '🔮'
  },
  NAP4: {
    id: 'NAP4', name: 'NAP 4', description: 'Trouvez 4 numéros parmi les 5 tirés',
    minNumbers: 4, maxNumbers: 4, defaultMultiplier: 10000, icon: '💎'
  },
  NAP5: {
    id: 'NAP5', name: 'NAP 5', description: 'Trouvez les 5 numéros tirés',
    minNumbers: 5, maxNumbers: 5, defaultMultiplier: 100000, icon: '👑'
  },
  
  // Types avancés et anciens (gardés pour compatibilité)
  PERMUTATION: {
    id: 'PERMUTATION', name: 'Permutation', description: 'Génère toutes les combinaisons NAP2',
    minNumbers: 3, maxNumbers: 10, autoGeneratesCombinations: true, defaultMultiplier: 500, icon: '🔄'
  },
  BANKA: {
    id: 'BANKA', name: 'Banka', description: 'Un numéro de base + des associés',
    minNumbers: 2, maxNumbers: 11, requiresBase: true, defaultMultiplier: 500, icon: '⭐'
  },
  CHANCE_PLUS: {
    id: 'CHANCE_PLUS', name: 'Chance+', description: 'Trouvez le numéro en première ou dernière position',
    minNumbers: 1, maxNumbers: 1, requiresPosition: true, defaultMultiplier: 90, icon: '🎰'
  },
  ANAGRAMME: {
    id: 'ANAGRAMME', name: 'Anagramme', description: 'Pariez sur un numéro ET son inversé',
    minNumbers: 1, maxNumbers: 1, defaultMultiplier: 10, icon: '🔃'
  },

  // --- AJOUTS POUR COMPATIBILITÉ ---
  // Ces types peuvent être référencés ailleurs dans votre code.
  // Ils sont maintenant des alias ou des doublons des types NAP.
  SIMPLE: { 
    name: "Simple", minNumbers: 5, maxNumbers: 5, defaultMultiplier: 100000 
  },
  DOUBLE: { 
    name: "Double", minNumbers: 2, maxNumbers: 2, defaultMultiplier: 250 
  },
};


// ===== FONCTIONS UTILITAIRES - TOUT LE RESTE EST INCHANGÉ =====

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

export function getAvailableBetTypes(): BetType[] {
  return Object.keys(BET_TYPES_CONFIG) as BetType[];
}

export function getBetTypeConfig(betType: BetType): BetTypeConfig {
  return BET_TYPES_CONFIG[betType];
}

export function calculatePermutationCombinations(totalNumbers: number): number {
  if (totalNumbers < 2) return 0;
  return (totalNumbers * (totalNumbers - 1)) / 2;
}

export function calculatePermutationCost(totalNumbers: number, betPerCombination: number): number {
  const combinations = calculatePermutationCombinations(totalNumbers);
  return combinations * betPerCombination;
}

export function generateNAP2Combinations(numbers: number[]): number[][] {
  const combinations: number[][] = [];
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      combinations.push([numbers[i], numbers[j]]);
    }
  }
  return combinations;
}

export function invertNumber(num: number): number | null {
  const str = num.toString();
  if (str.length === 1) return null;
  const inverted = parseInt(str.split('').reverse().join(''));
  return inverted <= 90 ? inverted : null;
}

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

export function getDrawById(drawId: string): Draw | undefined {
  const draws = getDrawsFromLocalStorage();
  return draws.find(d => String(d.id) === String(drawId));
}

export function saveDrawsToLocalStorage(draws: Draw[]): void {
  localStorage.setItem('loto_happy_draws', JSON.stringify(draws));
}

export function getDrawsFromLocalStorage(): Draw[] {
  try {
    const data = localStorage.getItem('loto_happy_draws');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors du chargement des tirages:', error);
    return [];
  }
}

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

export function updateDraw(drawId: string, updates: Partial<Draw>): Draw | null {
  const draws = getDrawsFromLocalStorage();
  const index = draws.findIndex(d => d.id === drawId);
  
  if (index === -1) return null;
  
  draws[index] = { ...draws[index], ...updates };
  saveDrawsToLocalStorage(draws);
  
  return draws[index];
}

export function deleteDraw(drawId: string): boolean {
  const draws = getDrawsFromLocalStorage();
  const filtered = draws.filter(d => d.id !== drawId);
  
  if (filtered.length === draws.length) return false;
  
  saveDrawsToLocalStorage(filtered);
  return true;
}

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
      operatorName: 'Opérateur inconnu', country: '', fullName: 'Opérateur inconnu',
      time: draw.time, countdown: '', icon: '🎯', color: '#FFD700'
    };
  }
  
  const drawDateTime = new Date(`${draw.date}T${draw.time}`);
  const now = new Date();
  const diff = drawDateTime.getTime() - now.getTime();
  
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
    operatorName: operator.name, country: operator.country, fullName: `${operator.name} (${operator.country})`,
    time: draw.time, countdown, icon: operator.icon, color: operator.color
  };
}

export function getDefaultMultipliers(): { [K in BetType]: number } {
  const multipliers = {} as { [K in BetType]: number };
  for (const key in BET_TYPES_CONFIG) {
      const betType = key as BetType;
      multipliers[betType] = BET_TYPES_CONFIG[betType].defaultMultiplier;
  }
  return multipliers;
}