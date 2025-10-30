# 🔧 Guide d'Intégration - Paris Avancés

## ✅ Fichiers Créés/Modifiés

### Nouveaux Fichiers
- ✅ `/components/GameScreenAdvanced.tsx` - Interface de jeu avec paris avancés
- ✅ `/GUIDE_PARIS_AVANCES.md` - Documentation complète
- ✅ `/INTEGRATION_PARIS_AVANCES.md` - Ce fichier

### Fichiers Modifiés
- ✅ `/utils/games.ts` - Ajout des types BetType et configurations
- ✅ `/utils/draws.ts` - Support des nouveaux types de paris et calcul des gains
- ✅ `/components/admin/AdminGames.tsx` - Support de l'ordre des numéros pour CHANCE+

---

## 🚀 Comment Activer dans App.tsx

### Option 1 : Remplacer Complètement GameScreen

Dans `/App.tsx`, remplacez :

```typescript
import { GameScreen } from './components/GameScreen';
```

par :

```typescript
import { GameScreenAdvanced as GameScreen } from './components/GameScreenAdvanced';
```

**Avantage :** Activation immédiate, tous les jeux utilisent le nouveau système

---

### Option 2 : Garder les Deux (Recommandé pour Tests)

1. Importez les deux composants :

```typescript
import { GameScreen } from './components/GameScreen';
import { GameScreenAdvanced } from './components/GameScreenAdvanced';
```

2. Ajoutez un état pour basculer :

```typescript
const [useAdvancedBetting, setUseAdvancedBetting] = useState(true);
```

3. Dans le rendu, utilisez conditionnellement :

```typescript
{currentScreen === 'game' && gameId && (
  useAdvancedBetting ? (
    <GameScreenAdvanced
      gameId={gameId}
      onBack={() => setCurrentScreen('dashboard')}
      onNavigateToProfile={() => setCurrentScreen('profile')}
      playBalance={user?.balanceGame || 0}
      onPlaceBet={handlePlaceBet}
    />
  ) : (
    <GameScreen
      gameId={gameId}
      onBack={() => setCurrentScreen('dashboard')}
      onNavigateToProfile={() => setCurrentScreen('profile')}
      playBalance={user?.balanceGame || 0}
      onPlaceBet={handlePlaceBet}
    />
  )
)}
```

4. Ajoutez un bouton dans les paramètres pour basculer entre les deux

---

### Option 3 : Mode Hybride (Par Jeu)

Certains jeux en mode basique, d'autres en mode avancé :

```typescript
const isAdvancedGame = (gameId: string) => {
  // Jeux avec paris avancés
  const advancedGames = [
    'loto-kadoo-5naps',
    'benin-loto-5naps',
    // ... ajoutez les jeux qui supportent les paris avancés
  ];
  return advancedGames.includes(gameId);
};

// Dans le rendu
{currentScreen === 'game' && gameId && (
  isAdvancedGame(gameId) ? (
    <GameScreenAdvanced {...props} />
  ) : (
    <GameScreen {...props} />
  )
)}
```

---

## ⚙️ Configurations Optionnelles

### Ajuster les Multiplicateurs de Gain

Dans `/utils/games.ts`, ligne ~352, modifiez `BET_TYPES_CONFIG` :

```typescript
export const BET_TYPES_CONFIG: { [key in BetType]: BetTypeConfig } = {
  NAP1: {
    // ...
    multiplier: 10, // ← Changez ici
  },
  NAP2: {
    // ...
    multiplier: 500, // ← Changez ici
  },
  // ... etc
};
```

**Recommandations :**
- NAP1 : 8-12
- NAP2 : 400-600
- NAP3 : 2000-3000
- NAP4 : 8000-12000
- NAP5 : 80000-120000
- PERMUTATION : 400-600 (par combo)
- BANKA : 400-600
- CHANCE+ : 80-100
- ANAGRAMME : 8-12

---

### Limiter Certains Types de Paris

Dans `/utils/games.ts`, ligne ~398, modifiez `getAvailableBetTypes()` :

```typescript
export function getAvailableBetTypes(gameType: GameType): BetType[] {
  if (gameType === '2naps') {
    // Pour les jeux 2naps, limiter aux paris simples
    return ['NAP1', 'NAP2', 'PERMUTATION', 'ANAGRAMME'];
  }
  
  if (gameType === '3naps') {
    // Pour les jeux 3naps
    return ['NAP1', 'NAP2', 'NAP3', 'PERMUTATION', 'BANKA', 'ANAGRAMME'];
  }
  
  // Pour les jeux 5naps, tous les types sont disponibles
  return ['NAP1', 'NAP2', 'NAP3', 'NAP4', 'NAP5', 'PERMUTATION', 'BANKA', 'CHANCE_PLUS', 'ANAGRAMME'];
}
```

---

### Ajuster les Limites de Mise par Type

Dans `/components/GameScreenAdvanced.tsx`, ligne ~220-230, ajoutez :

```typescript
const getMinBetForType = (betType: BetType): number => {
  const minBets = {
    NAP1: 50,
    NAP2: 100,
    NAP3: 200,
    NAP4: 500,
    NAP5: 1000,
    PERMUTATION: 100,
    BANKA: 200,
    CHANCE_PLUS: 100,
    ANAGRAMME: 50,
  };
  return minBets[betType] || gameConfig.minBet;
};

const getMaxBetForType = (betType: BetType): number => {
  const maxBets = {
    NAP5: 10000, // Limiter le jackpot
    NAP4: 20000,
    // ... autres limites
  };
  return maxBets[betType] || gameConfig.maxBet;
};
```

---

## 🛡️ Sécurité et Gestion du Risque

### Limiter les Combinaisons PERMUTATION

Dans `/components/GameScreenAdvanced.tsx`, ligne ~166 :

```typescript
const MAX_PERMUTATION_NUMBERS = 8; // Au lieu de 10

// Dans BET_TYPES_CONFIG
PERMUTATION: {
  // ...
  maxNumbers: 8, // ← Changez ici
}
```

**Pourquoi ?**
- 10 numéros = 45 combinaisons × 500 × mise = Risque élevé
- 8 numéros = 28 combinaisons = Risque modéré

---

### Surveiller les Paris BANKA

Ajoutez un système d'alerte pour les numéros de base trop populaires :

```typescript
// Dans /utils/draws.ts, après createTicket()

export function checkBankaRisk(drawId: number, baseNumber: number): {
  isHigh: boolean;
  count: number;
} {
  const tickets = getTicketsForDraw(drawId);
  const bankaTickets = tickets.filter(
    t => t.betType === 'BANKA' && t.baseNumber === baseNumber
  );
  
  return {
    isHigh: bankaTickets.length > 10, // Seuil d'alerte
    count: bankaTickets.length
  };
}
```

---

### Plafond de Gain par Tirage

Dans `/utils/draws.ts`, fonction `submitDrawResults()` :

```typescript
const MAX_TOTAL_WINNINGS = 10000000; // 10M F CFA max par tirage

export function submitDrawResults(drawId: number, winningNumbers: string, winningNumbersOrdered?: number[]): void {
  // ... code existant ...
  
  // Avant distribution
  if (totalWinnings > MAX_TOTAL_WINNINGS) {
    console.warn(`⚠️ Plafond atteint : ${totalWinnings.toLocaleString()} F CFA`);
    
    // Option 1 : Réduire proportionnellement tous les gains
    const ratio = MAX_TOTAL_WINNINGS / totalWinnings;
    tickets.forEach(ticket => {
      if (ticket.winAmount) {
        ticket.winAmount = Math.floor(ticket.winAmount * ratio);
      }
    });
    
    // Option 2 : Alerter admin et bloquer
    // toast.error('Plafond de gains atteint - Contact admin requis');
    // return;
  }
  
  // ... suite du code ...
}
```

---

## 📊 Dashboard Admin - Statistiques

### Ajouter une Section "Paris Avancés"

Dans `/components/admin/AdminDashboard.tsx` :

```typescript
const getBetTypeStats = () => {
  const tickets = getTickets();
  const stats: { [key in BetType]?: number } = {};
  
  tickets.forEach(ticket => {
    const betType = ticket.betType || 'NAP2';
    stats[betType] = (stats[betType] || 0) + 1;
  });
  
  return stats;
};

// Affichage
<Card>
  <h3>Popularité des Types de Paris</h3>
  {Object.entries(getBetTypeStats()).map(([type, count]) => (
    <div key={type}>
      {BET_TYPES_CONFIG[type as BetType].icon} {BET_TYPES_CONFIG[type as BetType].name}: {count}
    </div>
  ))}
</Card>
```

---

## 🧪 Tests Essentiels

### Checklist de Test Avant Production

- [ ] **NAP1** : Un numéro sort → Gain correct
- [ ] **NAP2** : Deux numéros sortent → Gain × 500
- [ ] **NAP3** : Trois numéros sortent → Gain × 2500
- [ ] **PERMUTATION** : Une combo gagne → Gain calculé
- [ ] **PERMUTATION** : Plusieurs combos gagnent → Gains multiples
- [ ] **BANKA** : Base sort sans associés → Pas de gain
- [ ] **BANKA** : Base + 1 associé sortent → Gain proportionnel
- [ ] **BANKA** : Base + plusieurs associés → Gain multiplié
- [ ] **CHANCE+** : Numéro en bonne position → Gain × 90
- [ ] **CHANCE+** : Numéro en mauvaise position → Pas de gain
- [ ] **ANAGRAMME** : Numéro OU inversé sort → Gain × 10
- [ ] **Admin** : Ordre des numéros sauvegardé correctement
- [ ] **Limites** : Mise min/max respectées
- [ ] **Solde** : Déduction correcte pour PERMUTATION

### Script de Test Automatique

```typescript
// /utils/testAdvancedBets.ts
export function runAdvancedBetsTests() {
  console.log('🧪 Tests des Paris Avancés...\n');
  
  // Test NAP2
  const testNAP2 = {
    numbers: '10,20',
    betType: 'NAP2' as BetType,
    betAmount: 100,
  };
  
  const drawNAP2 = {
    winningNumbers: '5,10,20,35,50',
    winningNumbersOrdered: [5,10,20,35,50],
  };
  
  const gainNAP2 = calculateAdvancedWinAmount(testNAP2 as any, drawNAP2 as any);
  console.assert(gainNAP2 === 50000, '❌ NAP2 failed');
  console.log('✅ NAP2: OK');
  
  // ... autres tests ...
  
  console.log('\n✨ Tests terminés !');
}
```

---

## 🎨 Personnalisation de l'Interface

### Changer les Couleurs par Type

Dans `/components/GameScreenAdvanced.tsx`, ligne ~580-620 :

```typescript
const getBetTypeColor = (betType: BetType): string => {
  const colors = {
    NAP1: '#FFD700',  // Or
    NAP2: '#FF6B00',  // Orange
    NAP3: '#4F00BC',  // Violet
    NAP4: '#00A651',  // Vert
    NAP5: '#FF0000',  // Rouge (jackpot)
    PERMUTATION: '#00BFFF', // Bleu ciel
    BANKA: '#FFD700',  // Or
    CHANCE_PLUS: '#FF1493', // Rose
    ANAGRAMME: '#8A2BE2', // Violet bleu
  };
  return colors[betType];
};
```

---

### Ajouter des Animations

```typescript
import { motion, AnimatePresence } from 'motion/react';

// Dans la grille de numéros
<AnimatePresence>
  {selectedNumbers.map(num => (
    <motion.div
      key={num}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: "spring" }}
    >
      {num}
    </motion.div>
  ))}
</AnimatePresence>
```

---

## 📱 Responsive Mobile

Le nouveau `GameScreenAdvanced` est déjà responsive, mais pour optimiser :

```css
/* Dans globals.css */
@media (max-width: 640px) {
  .number-grid {
    grid-template-columns: repeat(7, 1fr); /* Au lieu de 9 */
  }
  
  .bet-type-select {
    font-size: 0.875rem;
  }
}
```

---

## 🚀 Déploiement

### Étapes Recommandées

1. **Phase 1 : Tests Internes (1 semaine)**
   - Activer uniquement pour les admins
   - Tester tous les scénarios
   - Vérifier les calculs de gains

2. **Phase 2 : Bêta Fermée (2 semaines)**
   - Activer pour 10-20 utilisateurs de confiance
   - Recueillir les retours
   - Ajuster les multiplicateurs si nécessaire

3. **Phase 3 : Lancement Progressif**
   - Activer d'abord NAP1, NAP2, PERMUTATION
   - Puis ajouter BANKA et ANAGRAMME
   - Enfin CHANCE+ et les NAP3-5

4. **Phase 4 : Lancement Complet**
   - Tous les types disponibles
   - Communication marketing
   - Support utilisateur renforcé

---

## 📞 Support et Documentation

### Messages d'Aide Contextuels

Ajoutez des tooltips dans l'interface :

```typescript
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <Info className="h-4 w-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent>
      <p>{betTypeConfig.description}</p>
      <p className="text-xs mt-2">Gain: Mise × {betTypeConfig.multiplier}</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
```

---

## ✅ Checklist de Pré-Lancement

- [ ] Tests de tous les types de paris effectués
- [ ] Multiplicateurs validés et rentables
- [ ] Limites de mise configurées
- [ ] Interface responsive testée
- [ ] Documentation utilisateur prête
- [ ] Support admin formé
- [ ] Système d'alerte en place
- [ ] Backup de la base de données
- [ ] Plan de communication prêt

---

## 🎉 Félicitations !

Vous avez maintenant un système de paris avancés professionnel et compétitif !

**Prochaine étape :** Testez, ajustez, et lancez ! 🚀
