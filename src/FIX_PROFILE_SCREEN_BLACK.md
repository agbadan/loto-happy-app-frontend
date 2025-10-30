# 🔧 Correctif : Écran noir dans ProfileScreen

## Problème
Lorsqu'un joueur clique sur "Profil" dans le dashboard, l'écran devient noir avec une erreur dans la console :
```
TypeError: d.winningNumbers.split is not a function
```

## Cause
Le problème venait d'une incohérence dans le type de données de `winningNumbers` :

### Dans les interfaces (draws.ts) :
- `BetHistoryItem.winningNumbers` est défini comme `number[]` (tableau de nombres)
- `WinNotification.winningNumbers` est défini comme `number[]` (tableau de nombres)

### Dans le code de rendu :
- **BetHistory.tsx** ligne 202 : tentait d'appeler `.split(',')` sur `bet.winningNumbers`
- **WinNotification.tsx** ligne 218 : tentait d'appeler `.split(',')` sur `currentNotification.winningNumbers`

La méthode `.split()` ne fonctionne que sur des chaînes de caractères, pas sur des tableaux !

## Solution appliquée

### 1. BetHistory.tsx
Ajout d'une vérification pour gérer les deux formats (tableau ou chaîne) :
```typescript
{(Array.isArray(bet.winningNumbers) 
  ? bet.winningNumbers 
  : bet.winningNumbers.toString().split(',')
).map((num, index) => {
  const numStr = num.toString().trim();
  const isMatch = bet.numbers.split(',').map(n => n.trim()).includes(numStr);
  // ... reste du code
})}
```

### 2. WinNotification.tsx
Même correction appliquée :
```typescript
{(Array.isArray(currentNotification.winningNumbers) 
  ? currentNotification.winningNumbers 
  : currentNotification.winningNumbers.toString().split(',')
).map((num, i) => {
  const numStr = num.toString().trim();
  const isMatched = currentNotification.playerNumbers.split(',').map(n => n.trim()).includes(numStr);
  // ... reste du code
})}
```

## Vérifications effectuées

✅ **AdminGames.tsx** : Correct
- Ligne 102 : Convertit bien la saisie en `numbersArray` (tableau de nombres)
- Ligne 109 : Envoie `numbersArray` à `submitDrawResults()`

✅ **draws.ts** : Correct
- `submitDrawResults()` accepte `winningNumbers: number[]`
- Les tirages sont bien stockés avec `winningNumbers` comme tableau

## Résultat
L'écran ProfileScreen s'affiche maintenant correctement sans erreur, même quand des tirages ont été complétés avec des numéros gagnants.

## Date de correction
29 octobre 2025
