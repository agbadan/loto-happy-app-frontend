# 🧪 Guide de Test - Multiplicateurs Dynamiques

## ✅ Test Rapide (5 minutes)

### Étape 1 : Créer un Tirage avec Multiplicateurs Personnalisés

1. **Ouvrir l'application**
2. **Se connecter comme Admin**
   - Numéro : +228 00 00 00 01
   - Mot de passe : admin123

3. **Aller dans Admin → Jeux**

4. **Cliquer "Nouveau tirage"**

5. **Remplir le formulaire :**
   - Jeu : Loto Kadoo 2naps
   - Date : Demain (ou aujourd'hui)
   - Heure : Dans 2 heures
   
6. **Modifier les multiplicateurs :**
   - NAP1 : **15** (au lieu de 10)
   - NAP2 : **600** (au lieu de 500)
   - Laisser les autres par défaut

7. **Cliquer "Créer le tirage"**

✅ **Résultat attendu :** Message "Nouveau tirage créé avec succès"

---

### Étape 2 : Vérifier l'Affichage Joueur

1. **Se déconnecter de l'admin**

2. **Se connecter comme Joueur**
   - Créer un nouveau compte ou utiliser un existant

3. **Aller sur le Dashboard**

4. **Cliquer sur "Loto Kadoo 2naps"**

5. **Vérifier l'interface :**
   - Menu déroulant "Type de Pari" est présent
   - 9 types de paris disponibles

6. **Sélectionner "NAP2"**

7. **Vérifier le badge de gain :**
   - Doit afficher "Gain x**600**" (et non x500)

✅ **Résultat attendu :** Le multiplicateur personnalisé (600) est affiché

---

### Étape 3 : Placer un Pari

1. **Sélectionner 2 numéros** (ex: 10, 20)

2. **Définir mise : 100 F**

3. **Vérifier le gain potentiel :**
   - Doit afficher : **60,000 F** (100 × 600)
   - Et non 50,000 F

4. **Valider le pari**

✅ **Résultat attendu :** Pari accepté, solde déduit

---

### Étape 4 : Saisir les Résultats et Vérifier les Gains

1. **Retourner en Admin**

2. **Aller dans "En attente de résultats"**

3. **Saisir les résultats :**
   - Numéros gagnants : **10, 20, 35, 45, 88**
   - (Dans cet ordre pour CHANCE+)

4. **Enregistrer et distribuer**

5. **Retourner en Joueur**

6. **Vérifier le Solde de Gains :**
   - Doit avoir reçu **60,000 F**
   - Et non 50,000 F

✅ **Résultat attendu :** Gain de 60,000 F crédité (avec multiplicateur personnalisé)

---

## 🧪 Tests Avancés

### Test A : Tous les Types de Paris

**Objectif :** Vérifier que chaque type utilise son multiplicateur

1. Créer un tirage avec multiplicateurs variés :
   - NAP1 : 12
   - NAP2 : 550
   - NAP3 : 2700
   - PERMUTATION : 550
   - BANKA : 600
   - CHANCE_PLUS : 95
   - ANAGRAMME : 12

2. Tester chaque type de pari

3. Vérifier que le gain potentiel utilise le bon multiplicateur

---

### Test B : PERMUTATION

**Objectif :** Vérifier le calcul avec combinaisons multiples

1. Créer un tirage avec PERMUTATION × 600

2. Joueur sélectionne 4 numéros (6 combinaisons)

3. Mise : 100 F par combo (600 F total)

4. Vérifier gain potentiel : 100 × **600** = 60,000 F (par combo gagnante)

5. Saisir résultats avec 2 de ces 4 numéros

6. Vérifier qu'une combinaison NAP2 gagne 60,000 F

---

### Test C : BANKA

**Objectif :** Vérifier le calcul proportionnel

1. Créer un tirage avec BANKA × 600

2. Joueur :
   - Base : 7
   - Associés : 21, 28, 35

3. Mise : 300 F

4. Résultats : 5, **7**, **28**, 40, 88
   - Base 7 ✅
   - 1 associé sur 3 (28)

5. Gain attendu : 300 × 600 × (1/3) = **60,000 F**

---

### Test D : CHANCE+

**Objectif :** Vérifier l'ordre de tirage

1. Créer un tirage avec CHANCE_PLUS × 100

2. Joueur :
   - Position : **Dernier**
   - Numéro : 88

3. Mise : 100 F

4. Admin saisit dans l'ordre : 5, 10, 20, 35, **88**
   - 88 est bien le dernier

5. Gain attendu : 100 × 100 = **10,000 F**

6. Tester aussi avec 88 PAS en dernier → 0 F

---

### Test E : ANAGRAMME

**Objectif :** Vérifier l'inversé automatique

1. Créer un tirage avec ANAGRAMME × 12

2. Joueur :
   - Numéro : 12

3. Vérifier que 21 apparaît automatiquement

4. Mise : 100 F

5. Résultats : 5, **21**, 35, 40, 88
   - 21 (inversé de 12) est sorti

6. Gain attendu : 100 × 12 = **1,200 F**

---

## 🔍 Vérifications Importantes

### ✅ Checklist Interface Admin

- [ ] Modal "Nouveau tirage" s'ouvre
- [ ] Grille de 9 multiplicateurs affichée
- [ ] Valeurs par défaut pré-remplies
- [ ] Modification des valeurs fonctionne
- [ ] Info-bulle explicative visible
- [ ] Tirage créé avec succès
- [ ] Multiplicateurs enregistrés

### ✅ Checklist Interface Joueur

- [ ] 9 types de paris dans le menu
- [ ] Descriptions affichées
- [ ] Badge "Gain x{multiplicateur}" correct
- [ ] Gain potentiel calculé correctement
- [ ] Sélection de numéros fonctionne
- [ ] Pari validé avec succès

### ✅ Checklist Calcul des Gains

- [ ] NAP1-5 : Multiplicateur du tirage utilisé
- [ ] PERMUTATION : Gain par combo correct
- [ ] BANKA : Calcul proportionnel correct
- [ ] CHANCE+ : Position vérifiée
- [ ] ANAGRAMME : Inversé détecté
- [ ] Gains crédités au bon solde

---

## 🐛 Dépannage

### Problème : Multiplicateurs pas affichés dans la modal

**Solution :**
- Vérifier que `BET_TYPES_CONFIG` est importé
- Vérifier la console pour erreurs
- Rafraîchir la page

### Problème : Badge affiche multiplicateur par défaut

**Solution :**
- Vérifier que le tirage a bien des multiplicateurs
- Console : `localStorage.getItem('loto_happy_draws')`
- Vérifier `nextDrawData?.multipliers`

### Problème : Gains incorrects

**Solution :**
- Vérifier que `calculateAdvancedWinAmount` utilise `draw.multipliers`
- Console : Logger `multiplier` dans la fonction
- Vérifier le ticket : `ticket.betType`

---

## 📝 Notes pour Débogage

### Voir les Tirages avec Multiplicateurs

```javascript
// Dans la console du navigateur
const draws = JSON.parse(localStorage.getItem('loto_happy_draws') || '[]');
console.table(draws.map(d => ({
  id: d.id,
  game: d.gameName,
  NAP2: d.multipliers?.NAP2,
  NAP5: d.multipliers?.NAP5
})));
```

### Voir un Ticket Complet

```javascript
const tickets = JSON.parse(localStorage.getItem('loto_happy_tickets') || '[]');
console.log(tickets[tickets.length - 1]); // Dernier ticket
```

### Réinitialiser les Tirages

```javascript
localStorage.removeItem('loto_happy_draws');
// Puis rafraîchir la page
```

---

## ✅ Résultat Attendu Final

Après tous ces tests, vous devriez avoir :

1. ✅ Un tirage créé avec multiplicateurs personnalisés
2. ✅ Interface joueur affichant les bons multiplicateurs
3. ✅ Paris placés avec différents types
4. ✅ Gains calculés avec les multiplicateurs du tirage
5. ✅ Soldes mis à jour correctement

**Si tout fonctionne → Système prêt pour production ! 🎉**

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifier ce guide de test
2. Consulter `/MULTIPLICATEURS_DYNAMIQUES.md`
3. Consulter `/GUIDE_PARIS_AVANCES.md`
4. Vérifier la console du navigateur
5. Utiliser les scripts de débogage ci-dessus

**Bon test ! 🚀**
