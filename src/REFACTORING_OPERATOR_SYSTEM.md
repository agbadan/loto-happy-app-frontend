# 🎯 REFACTORING : Système Opérateurs vs Types de Jeux

## 📋 Contexte et Problème

### ❌ Ancienne Logique (Incorrecte)
```
Admin créait des tirages pour :
├─ Bénin Lotto 2naps (10h)
├─ Bénin Lotto 3naps (10h)  
└─ Bénin Lotto 5naps (10h)

→ Problème : 3 tirages séparés pour le même opérateur !
→ Si un joueur veut jouer 5naps mais que l'admin a créé seulement 2naps, ça ne marche pas !
```

### ✅ Nouvelle Logique (Correcte)
```
1. Admin crée UN SEUL tirage :
   "Bénin Lotto" - 29/10/2025 à 10:39
   
2. Ce tirage va tirer 5 numéros :
   12, 23, 34, 45, 56
   
3. Les JOUEURS choisissent comment ils veulent parier :
   ├─ Joueur A : NAP2 (choisit 2 numéros)
   ├─ Joueur B : NAP5 (choisit 5 numéros)
   ├─ Joueur C : PERMUTATION (4 numéros)
   └─ Joueur D : BANKA (3 numéros dont 1 banquier)
   
4. TOUS parient sur le MÊME tirage avec les MÊMES 5 numéros tirés
```

## 🔧 Fichiers Modifiés

### 1. `/utils/games.ts` ✅
**Avant :** 15 jeux (5 pays × 3 types)
**Après :** 5 opérateurs

```typescript
// AVANT
GAMES_CONFIG = [
  { id: 'togo-kadoo-2naps', type: '2naps', ... },
  { id: 'togo-kadoo-3naps', type: '3naps', ... },
  { id: 'togo-kadoo-5naps', type: '5naps', ... },
  // ... × 5 pays = 15 jeux
]

// APRÈS
OPERATORS_CONFIG = [
  { id: 'togo-kadoo', name: 'Lotto Kadoo', country: 'Togo', ... },
  { id: 'benin-lotto', name: 'Bénin Lotto', country: 'Bénin', ... },
  { id: 'ivoire-lonaci', name: 'Lonaci', country: 'Côte d\'Ivoire', ... },
  { id: 'nigeria-greenlotto', name: 'Green Lotto', country: 'Nigeria', ... },
  { id: 'senegal-pmu', name: 'PMU Sénégal', country: 'Sénégal', ... }
]
```

**Nouvelle Structure de Tirage (Draw) :**
```typescript
interface Draw {
  id: string;
  operatorId: string;  // ← Au lieu de gameId
  date: string;
  time: string;
  
  // Multiplicateurs spécifiques à ce tirage
  multipliers: {
    NAP1?: number;
    NAP2?: number;
    NAP3?: number;
    NAP4?: number;
    NAP5?: number;
    PERMUTATION?: number;
    BANKA?: number;
    CHANCE_PLUS?: number;
    ANAGRAMME?: number;
  };
  
  status: 'upcoming' | 'pending' | 'completed';
  winningNumbers: number[]; // Les 5 numéros tirés
}
```

### 2. `/utils/draws.ts` ✅
**Changements :**
- Supprimé toutes les références à `gameId`, `gameName`, `country`, `type`
- Tickets utilisent maintenant `drawId` (string) au lieu de `drawId` (number)
- `createTicket()` prend maintenant `drawId` et `betType`
- `submitDrawResults()` utilise les multiplicateurs du tirage

### 3. `/components/admin/AdminGames.tsx` ✅
**Changements :**
- Modal de création : Sélection d'opérateur (pas de type de jeu)
- Configuration des multiplicateurs pour tous les types de paris
- Affichage des tirages par opérateur
- Les 5 numéros sont toujours tirés (pool 1-90)

**Exemple de Création :**
```
Opérateur : Lotto Kadoo (Togo)
Date : 2025-10-29
Heure : 10:39

Multiplicateurs :
NAP1 : 10×
NAP2 : 500×
NAP3 : 2500×
NAP4 : 10000×
NAP5 : 100000×
PERMUTATION : 500×
BANKA : 500×
CHANCE+ : 90×
ANAGRAMME : 10×
```

## 📝 Fichiers à Modifier (Prochaines Étapes)

### 4. `/components/Dashboard.tsx` ⏳
- Afficher les tirages disponibles (pas les jeux)
- Chaque carte = Un tirage disponible
- Format : "Lotto Kadoo (Togo) - 10:39"

### 5. `/components/GameScreen.tsx` ⏳
- Recevoir `drawId` au lieu de `gameId`
- Afficher les informations de l'opérateur
- Le joueur choisit son type de pari (NAP1-NAP5, etc.)
- Sélectionner les numéros selon le type choisi

### 6. `/components/GameScreenAdvanced.tsx` ⏳
- Adapter pour utiliser `drawId` et `operatorId`
- Afficher les multiplicateurs spécifiques au tirage

### 7. `/components/ResultsScreen.tsx` ⏳
- Afficher les résultats par opérateur
- Grouper les tirages par opérateur

## 🎮 Flux Utilisateur Final

```
1. Dashboard
   ├─ Carte "Lotto Kadoo (Togo) - 10:39"
   ├─ Carte "Bénin Lotto (Bénin) - 14:00"
   └─ Carte "Lonaci (CI) - 18:30"

2. Joueur clique sur "Lotto Kadoo (Togo) - 10:39"
   → GameScreen s'ouvre

3. GameScreen
   ├─ Affiche : Lotto Kadoo (Togo) - Tirage à 10:39
   ├─ "Choisissez votre type de pari :"
   │   ├─ NAP1 (1 numéro) - x10
   │   ├─ NAP2 (2 numéros) - x500
   │   ├─ NAP3 (3 numéros) - x2500
   │   ├─ NAP4 (4 numéros) - x10000
   │   ├─ NAP5 (5 numéros) - x100000
   │   ├─ PERMUTATION (3-10 numéros)
   │   ├─ BANKA (numéro de base + autres)
   │   ├─ CHANCE+ (position exacte)
   │   └─ ANAGRAMME (numéro inversé)
   │
   └─ Joueur sélectionne "NAP2"
       → Grille de numéros (1-90)
       → Choisit 2 numéros
       → Valide son pari

4. Au moment du tirage
   → 5 numéros sont tirés : 12, 23, 34, 45, 56
   → TOUS les types de paris sont évalués sur ces 5 numéros :
       ├─ NAP2 : Gagne si ses 2 numéros sont parmi les 5
       ├─ NAP5 : Gagne s'il a trouvé les 5 numéros
       ├─ BANKA : Gagne si son numéro de base + au moins 1 autre
       └─ etc.
```

## ✨ Avantages

1. **Cohérence :** Un tirage = Un opérateur = 5 numéros tirés
2. **Flexibilité :** Les joueurs choisissent leur stratégie de pari
3. **Simplicité Admin :** Plus besoin de créer 3 tirages par opérateur
4. **Réaliste :** Correspond au fonctionnement réel des loteries
5. **Évolutif :** Facile d'ajouter de nouveaux types de paris

## 📊 Configuration Standard

### Pool de Numéros
- **Toujours :** 1 à 90

### Nombre de Numéros Tirés
- **Toujours :** 5 numéros

### Fréquence
- **Variable :** Un opérateur peut avoir plusieurs tirages par jour

### Multiplicateurs Par Défaut
```
NAP1 : 10× (1 chance sur 18)
NAP2 : 500× (1 chance sur 4005)
NAP3 : 2500× (1 chance sur 117,480)
NAP4 : 10000× (1 chance sur 2,555,190)
NAP5 : 100000× (1 chance sur 43,949,268)
PERMUTATION : 500× par combinaison NAP2
BANKA : 500× (proportionnel aux numéros gagnants)
CHANCE+ : 90× (1 chance sur 90)
ANAGRAMME : 10× (couvre 2 numéros)
```

## 🚀 État d'Avancement

- [x] `/utils/games.ts` - Système d'opérateurs
- [x] `/utils/draws.ts` - Gestion des tirages refactorisée
- [x] `/components/admin/AdminGames.tsx` - Création de tirages par opérateur
- [x] `/components/Dashboard.tsx` - Affichage des tirages
- [x] `/components/GameScreen.tsx` - Sélection du type de pari
- [x] `/components/GameScreenAdvanced.tsx` - Interface des paris
- [x] `/components/ResultsScreen.tsx` - Résultats par opérateur
- [x] `/App.tsx` - Navigation avec drawId
- [ ] Tests complets du système

---

**Date de Refactoring :** 29 Octobre 2025  
**Status :** ✅ Refactorisation Complète - Prêt pour Tests
