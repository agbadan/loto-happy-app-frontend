# Système de Mise Variable - Documentation Complète

## Vue d'ensemble

Le système de mise variable permet aux joueurs de choisir le montant de leur pari, avec des gains proportionnels à la mise. Plus le joueur mise, plus il peut gagner.

## Fonctionnement du Système de Cotes

### Principe de Base

Le système utilise un multiplicateur proportionnel basé sur la mise :

```
Multiplicateur = Mise du joueur / Mise minimum du jeu
Gain = Prix de base × Multiplicateur
```

### Exemple Concret : Loto Kadoo 5naps

Configuration du jeu :
- Mise minimum : 500 F
- Mise maximum : 200,000 F
- Prix de base pour 5 numéros : 500,000 F
- Prix de base pour 4 numéros : 50,000 F
- Prix de base pour 3 numéros : 5,000 F

**Scénario 1 : Mise minimum (500 F)**
- Multiplicateur = 500 / 500 = 1×
- 5 numéros trouvés → 500,000 F
- 4 numéros trouvés → 50,000 F
- 3 numéros trouvés → 5,000 F

**Scénario 2 : Mise moyenne (5,000 F)**
- Multiplicateur = 5,000 / 500 = 10×
- 5 numéros trouvés → 5,000,000 F
- 4 numéros trouvés → 500,000 F
- 3 numéros trouvés → 50,000 F

**Scénario 3 : Mise maximum (200,000 F)**
- Multiplicateur = 200,000 / 500 = 400×
- 5 numéros trouvés → 200,000,000 F
- 4 numéros trouvés → 20,000,000 F
- 3 numéros trouvés → 2,000,000 F

## Interface Utilisateur

### Section de Sélection de Mise

1. **Mises Rapides** : Boutons prédéfinis pour les mises courantes
   - Mise minimum
   - Mise minimum × 2
   - Mise minimum × 5
   - Mise minimum × 10

2. **Mise Personnalisée** : Champ de saisie pour un montant spécifique
   - Validation automatique entre min et max
   - Affichage des limites

3. **Tableau des Gains Potentiels** : 
   - Affichage en temps réel des gains possibles
   - Mis à jour automatiquement selon la mise choisie
   - Organisé par nombre de numéros trouvés (du plus élevé au plus bas)

### Affichage des Informations

- **En-tête du jeu** : Affichage de la mise actuelle
- **Footer de validation** : Confirmation du montant avant validation
- **Historique** : Affichage de la mise pour chaque pari passé

## Modifications Techniques

### Fichiers Modifiés

#### 1. `/components/GameScreen.tsx`

**Nouveaux états :**
```typescript
const [betAmount, setBetAmount] = useState<number>(0);
const [customBetInput, setCustomBetInput] = useState<string>('');
```

**Nouvelles fonctions :**
- `handleQuickBet()` : Sélection rapide de mise
- `handleCustomBetChange()` : Validation de la mise personnalisée
- `calculatePotentialWinnings()` : Calcul des gains potentiels

**Nouveaux composants UI :**
- Sélecteur de mise avec boutons rapides
- Input pour mise personnalisée
- Tableau des gains potentiels avec icône TrendingUp

#### 2. `/utils/draws.ts`

**Fonction modifiée : `calculateWinAmount()`**

Avant :
```typescript
function calculateWinAmount(matchCount: number, gameId: string): number
```

Après :
```typescript
function calculateWinAmount(matchCount: number, gameId: string, betAmount: number): number
```

**Nouveau calcul :**
```typescript
const basePrize = game.prizes[matchCount] || 0;
const multiplier = betAmount / game.minBet;
return Math.floor(basePrize * multiplier);
```

**Impact sur `submitDrawResults()` :**
- Passage de `ticket.betAmount` à `calculateWinAmount()`
- Distribution automatique des gains proportionnels

## Limites et Contraintes

### Par Type de Jeu

| Type  | Mise Min | Mise Max   |
|-------|----------|------------|
| 2naps | 100 F    | 50,000 F   |
| 3naps | 200 F    | 100,000 F  |
| 5naps | 500 F    | 200,000 F  |

### Validation

- Impossible de miser moins que le minimum
- Impossible de miser plus que le maximum
- Arrondi automatique au franc près (pas de centimes)
- Vérification du solde avant validation

## Avantages du Système

1. **Flexibilité** : Les joueurs choisissent leur niveau de risque
2. **Équité** : Gains proportionnels à l'investissement
3. **Transparence** : Affichage clair des gains potentiels avant de jouer
4. **Simplicité** : Formule de calcul simple et compréhensible

## Tests Recommandés

### Scénarios à Tester

1. **Mise minimum** : Vérifier les gains de base
2. **Mise × 10** : Vérifier la multiplication correcte
3. **Mise maximum** : Vérifier les limites hautes
4. **Mise personnalisée** : Tester différents montants
5. **Validation de solde** : Essayer de miser plus que le solde disponible
6. **Historique** : Vérifier l'affichage des mises passées
7. **Admin** : Vérifier l'affichage des mises dans le panel admin

### Cas Limites

- Mise = 0 → Devrait forcer mise minimum
- Mise < minimum → Devrait ajuster au minimum
- Mise > maximum → Devrait ajuster au maximum
- Mise > solde → Devrait afficher erreur
- Mise décimale → Devrait arrondir

## Compatibilité

✅ Compatible avec le système de double solde (Jeu + Gains)
✅ Compatible avec le système de revendeurs
✅ Compatible avec l'historique des transactions
✅ Compatible avec le panel administrateur
✅ Compatible avec les notifications de gains

## Notes Importantes

- Les gains sont toujours crédités sur le **Solde des Gains**
- Les mises sont toujours déduites du **Solde de Jeu**
- Le système d'auto-masquage des jeux expirés est préservé
- Les anciennes données de paris (avec mise fixe) restent compatibles
