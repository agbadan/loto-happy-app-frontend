# Guide de Test : Système de Mise Variable

## Test 1 : Interface de Sélection de Mise

### Étapes
1. Connectez-vous en tant que joueur
2. Cliquez sur un jeu (ex: Loto Kadoo 5naps)
3. Vérifiez la présence de la nouvelle section "Choisissez votre mise"

### Éléments à Vérifier
✅ 4 boutons de mise rapide sont affichés
✅ Le premier bouton correspond à la mise minimum
✅ Un champ "Mise personnalisée" est disponible
✅ Les limites (min/max) sont affichées clairement
✅ Un tableau "Gains potentiels" est visible avec une icône 📈

### Résultat Attendu
Interface complète et claire pour choisir sa mise.

---

## Test 2 : Mises Rapides

### Étapes
1. Dans l'écran de jeu, observez les boutons de mise rapide
2. Cliquez sur chaque bouton l'un après l'autre
3. Observez les changements dans les gains potentiels

### Éléments à Vérifier
✅ Le bouton cliqué est surligné (couleur du jeu)
✅ Le montant en haut à droite se met à jour
✅ Le tableau des gains potentiels se met à jour en temps réel
✅ Les montants augmentent proportionnellement

### Exemple avec Loto Kadoo 5naps
- Mise 500 F → 5 numéros = 500,000 F
- Mise 1,000 F → 5 numéros = 1,000,000 F
- Mise 2,500 F → 5 numéros = 2,500,000 F
- Mise 5,000 F → 5 numéros = 5,000,000 F

---

## Test 3 : Mise Personnalisée

### Étapes
1. Cliquez dans le champ "Mise personnalisée"
2. Tapez 3000
3. Observez les gains potentiels

### Éléments à Vérifier
✅ Le montant saisi est accepté
✅ Les gains se mettent à jour automatiquement
✅ La valeur respecte les limites (min/max)

### Test des Limites
- Tapez 50 (< minimum) → Devrait ajuster à 500 F
- Tapez 500000 (> maximum) → Devrait ajuster à 200,000 F
- Tapez 7500 → Devrait accepter tel quel

---

## Test 4 : Calcul Proportionnel

### Formule de Vérification
```
Gain attendu = Prix de base × (Mise choisie / Mise minimum)
```

### Exemple Manuel
Pour Loto Kadoo 5naps (mise min 500 F) :
- Prix de base 5 numéros : 500,000 F
- Mise choisie : 2,000 F
- Multiplicateur : 2,000 / 500 = 4
- Gain attendu : 500,000 × 4 = 2,000,000 F

### Étapes
1. Choisissez une mise de 2,000 F
2. Vérifiez le gain affiché pour 5 numéros
3. Confirmez qu'il affiche 2,000,000 F

✅ Le calcul est correct

---

## Test 5 : Pari avec Mise Personnalisée

### Étapes
1. Choisissez une mise de 1,500 F
2. Sélectionnez vos numéros (5 numéros pour 5naps)
3. Cliquez sur "Valider le Pari"
4. Vérifiez votre solde de jeu

### Éléments à Vérifier
✅ Le solde de jeu diminue de 1,500 F (pas 500 F)
✅ Un message de confirmation s'affiche
✅ Les numéros sont enregistrés

---

## Test 6 : Historique des Paris

### Étapes
1. Après avoir placé un pari avec mise personnalisée
2. Allez dans "Profil" → "Historique des paris"
3. Cherchez votre dernier pari

### Éléments à Vérifier
✅ La colonne "Mise" affiche le bon montant (ex: 1,500 F)
✅ Tous les détails sont corrects
✅ Le statut est "À venir" ou "En attente"

---

## Test 7 : Distribution des Gains (Admin)

### Configuration Préalable
1. Connectez-vous en tant que joueur
2. Placez 2 paris sur le même tirage avec des mises différentes :
   - Pari 1 : Mise 500 F, numéros 1, 2, 3, 4, 5
   - Pari 2 : Mise 5,000 F, numéros 1, 2, 3, 4, 5

### Étapes Admin
1. Connectez-vous en tant qu'admin
2. Allez dans "Gestion des Jeux"
3. Sélectionnez le tirage avec vos 2 paris
4. Saisissez les résultats : 1, 2, 3, 4, 5 (tous gagnants)
5. Validez

### Éléments à Vérifier
✅ Les 2 tickets apparaissent comme gagnants
✅ Pari 1 gagne 500,000 F (mise × 1)
✅ Pari 2 gagne 5,000,000 F (mise × 10)
✅ Les gains sont différents malgré les mêmes numéros
✅ Les totaux (Total des mises, Total des gains) sont corrects

### Vérification Joueur
1. Revenez sur le compte joueur
2. Vérifiez le solde des gains
3. Allez dans l'historique

✅ Le solde des gains a augmenté de 5,500,000 F
✅ Les 2 paris sont marqués "Gagné"
✅ Les montants gagnés sont affichés correctement

---

## Test 8 : Solde Insuffisant

### Étapes
1. Notez votre solde de jeu actuel (ex: 2,000 F)
2. Essayez de choisir une mise de 5,000 F
3. Sélectionnez vos numéros
4. Tentez de valider

### Résultat Attendu
✅ Message d'erreur "Solde insuffisant"
✅ Le pari n'est pas enregistré
✅ Le solde ne change pas

---

## Test 9 : Différents Types de Jeux

### Étapes
Testez avec chaque type de jeu :

**2naps** (min 100 F, max 50,000 F)
- Mise 100 F → 2 numéros = 50,000 F
- Mise 1,000 F → 2 numéros = 500,000 F

**3naps** (min 200 F, max 100,000 F)
- Mise 200 F → 3 numéros = 150,000 F
- Mise 2,000 F → 3 numéros = 1,500,000 F

**5naps** (min 500 F, max 200,000 F)
- Mise 500 F → 5 numéros = 500,000 F
- Mise 5,000 F → 5 numéros = 5,000,000 F

### Éléments à Vérifier
✅ Chaque type a des limites différentes
✅ Les calculs sont corrects pour chaque type
✅ Les boutons de mise rapide s'adaptent

---

## Test 10 : Compatibilité avec Anciens Paris

### Étapes
Si vous avez des paris existants avant cette mise à jour :

1. Allez dans l'historique des paris
2. Vérifiez les anciens paris

### Éléments à Vérifier
✅ Les anciens paris affichent toujours leur mise
✅ Pas d'erreur d'affichage
✅ Le système est rétrocompatible

---

## Résumé des Tests

| Test | Description | Statut |
|------|-------------|--------|
| 1 | Interface de sélection | ⬜ |
| 2 | Mises rapides | ⬜ |
| 3 | Mise personnalisée | ⬜ |
| 4 | Calcul proportionnel | ⬜ |
| 5 | Pari avec mise | ⬜ |
| 6 | Historique | ⬜ |
| 7 | Distribution gains | ⬜ |
| 8 | Solde insuffisant | ⬜ |
| 9 | Différents types | ⬜ |
| 10 | Compatibilité | ⬜ |

---

## Bugs Potentiels à Surveiller

- ⚠️ Calcul incorrect avec mises très élevées
- ⚠️ Arrondi incorrect des gains
- ⚠️ Validation de mise ne respectant pas les limites
- ⚠️ Gains potentiels ne se mettant pas à jour
- ⚠️ Déduction incorrecte du solde
- ⚠️ Affichage incorrect dans l'historique

---

## En Cas de Problème

1. Vérifiez la console du navigateur (F12)
2. Vérifiez le localStorage : `localStorage.getItem('loto_happy_tickets')`
3. Notez le message d'erreur exact
4. Testez avec différents montants
5. Réinitialisez les données si nécessaire
