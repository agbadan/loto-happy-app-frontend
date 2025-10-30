# 🎯 Guide de Test - Système Opérateurs

## 📋 Vue d'Ensemble

Le système a été complètement refactorisé pour passer d'une logique **"15 jeux par types"** à une logique **"5 opérateurs + types de paris"**.

### ✨ Changements Majeurs

**Avant :**
- Admin créait 3 tirages par opérateur (2naps, 3naps, 5naps)
- Les joueurs choisissaient un jeu pré-configuré
- 15 configurations de jeux différentes

**Maintenant :**
- Admin crée 1 tirage par opérateur
- Le tirage tire toujours **5 numéros** (pool 1-90)
- Les joueurs choisissent leur **type de pari** (NAP1-NAP5, PERMUTATION, BANKA, CHANCE+, ANAGRAMME)
- Tous les paris utilisent les **mêmes 5 numéros gagnants**

---

## 🧪 Plan de Test Complet

### PHASE 1 : Connexion Admin

1. **Ouvrir l'application**
2. **Se connecter en tant qu'admin**
   - Numéro : `+228 00 00 00 01`
   - Mot de passe : `admin123`
3. **Vérifier** que le tableau de bord admin s'affiche

**✅ Résultat attendu :** Connexion réussie, interface admin visible

---

### PHASE 2 : Création de Tirages (Admin)

1. **Aller dans "Gestion des Tirages"**
2. **Cliquer sur "Nouveau Tirage"**
3. **Vérifier** que le modal affiche :
   - Sélection d'opérateur (5 choix : Lotto Kadoo, Bénin Lotto, Lonaci, Green Lotto, PMU Sénégal)
   - Champ Date
   - Champ Heure
   - **9 champs de multiplicateurs** (NAP1-NAP5, PERMUTATION, BANKA, CHANCE+, ANAGRAMME)

4. **Créer un tirage de test :**
   ```
   Opérateur : Lotto Kadoo (Togo)
   Date : 31/10/2025
   Heure : 14:00
   
   Multiplicateurs (laisser les valeurs par défaut) :
   - NAP1 : 10
   - NAP2 : 500
   - NAP3 : 2500
   - NAP4 : 10000
   - NAP5 : 100000
   - PERMUTATION : 500
   - BANKA : 500
   - CHANCE+ : 90
   - ANAGRAMME : 10
   ```

5. **Cliquer sur "Créer le Tirage"**
6. **Vérifier** que le tirage apparaît dans l'onglet "À Venir"

**✅ Résultat attendu :** 
- Tirage créé avec succès
- Affiché comme "Lotto Kadoo (Togo) - 31/10/2025 à 14:00"
- Aucune mention de "2naps", "3naps" ou "5naps"

7. **Créer 2-3 autres tirages** pour différents opérateurs

---

### PHASE 3 : Vue Joueur - Dashboard

1. **Se déconnecter de l'admin**
2. **Se connecter en tant que joueur**
   - Utiliser le compte Google de test : `demo@gmail.com`
   - Ou créer un nouveau compte

3. **Sur le Dashboard :**
   - **Vérifier** que le tirage vedette affiche :
     - Nom de l'opérateur (ex: "Lotto Kadoo")
     - Pays (ex: "Togo")
     - Date et heure du tirage
     - Compte à rebours
     - Message "Tentez de gagner jusqu'à 100,000× votre mise !"

4. **Scroller vers "Tirages Disponibles"**
   - **Vérifier** que chaque carte affiche :
     - Icône de l'opérateur
     - Nom de l'opérateur
     - Pays
     - Date du tirage
     - Heure du tirage
     - Compte à rebours

**✅ Résultat attendu :**
- Tirages affichés par opérateur (pas par type de jeu)
- Aucune mention de "2naps", "3naps", "5naps"
- Format : "Lotto Kadoo (Togo) - 14:00"

---

### PHASE 4 : Sélection du Type de Pari

1. **Cliquer sur un tirage disponible**
2. **Vérifier** l'écran de sélection du type de pari :
   - Header avec nom de l'opérateur et pays
   - Informations du tirage (date, heure, compte à rebours)
   - **9 cartes de types de paris** :
     - NAP1 (Simple Numéro) - x10
     - NAP2 (Deux Numéros / Two Sure) - x500
     - NAP3 (Trois Numéros) - x2500
     - NAP4 (Quatre Numéros) - x10000
     - NAP5 (Cinq Numéros / Perm Nap) - x100000
     - PERMUTATION (Combinaison) - x500
     - BANKA (Numéro de Base / Against) - x500
     - CHANCE+ (Position Exacte) - x90
     - ANAGRAMME (Numéros Inversés) - x10

3. **Vérifier** que chaque carte affiche :
   - Icône du type de pari
   - Nom et description
   - Multiplicateur
   - Nombre de numéros requis
   - Bouton "Choisir"

**✅ Résultat attendu :**
- 9 types de paris affichés
- Multiplicateurs corrects
- Interface claire et intuitive

---

### PHASE 5 : Test NAP2 (Paris Simple)

1. **Cliquer sur "NAP2 (Deux Numéros)"**
2. **Vérifier** l'interface de paris :
   - Grille de 90 numéros (1-90)
   - Bouton "Sélection Rapide"
   - Récapitulatif à droite

3. **Sélectionner 2 numéros** (ex: 5 et 23)
4. **Vérifier** le récapitulatif :
   - Numéros sélectionnés : "5, 23"
   - Mise par défaut : 100 F
   - Gain potentiel : 50,000 F (100 × 500)

5. **Changer la mise** à 1000 F
6. **Vérifier** gain potentiel : 500,000 F (1000 × 500)

7. **Cliquer sur "Valider le Pari"**
8. **Vérifier** :
   - Toast de succès
   - Solde de jeu déduit
   - Retour au dashboard

**✅ Résultat attendu :**
- Pari placé avec succès
- Solde mis à jour
- Pari enregistré

---

### PHASE 6 : Test PERMUTATION

1. **Revenir au même tirage**
2. **Choisir "PERMUTATION"**
3. **Sélectionner 4 numéros** (ex: 10, 20, 30, 40)
4. **Vérifier** le récapitulatif :
   - Numéros sélectionnés : "10, 20, 30, 40"
   - **Combinaisons générées : 6** (C(4,2) = 6)
   - Mise par combinaison : 100 F
   - **Coût total : 600 F** (6 × 100)
   - Gain potentiel : 300,000 F (6 × 100 × 500)

5. **Valider le pari**
6. **Vérifier** que 600 F ont été déduits

**✅ Résultat attendu :**
- Calcul correct des combinaisons
- Coût total = nombre de combinaisons × mise
- Pari enregistré avec toutes les combinaisons

---

### PHASE 7 : Test BANKA (Numéro de Base)

1. **Revenir au tirage**
2. **Choisir "BANKA"**
3. **Vérifier** le message d'aide :
   - "Sélectionnez d'abord votre numéro de base (surligné en or)"
   - "Ensuite, sélectionnez vos numéros associés"

4. **Sélectionner un numéro de base** (ex: 15)
   - **Vérifier** qu'il est surligné en **or**

5. **Sélectionner 3 numéros associés** (ex: 25, 35, 45)
   - **Vérifier** qu'ils sont surlignés en **violet**

6. **Vérifier** le récapitulatif :
   - Badge "Base: 15" (or)
   - Badge "25, 35, 45" (violet)
   - Mise : 500 F
   - Gain potentiel : 250,000 F

7. **Valider le pari**

**✅ Résultat attendu :**
- Distinction visuelle entre numéro de base et associés
- Pari enregistré correctement

---

### PHASE 8 : Test CHANCE+ (Position Exacte)

1. **Revenir au tirage**
2. **Choisir "CHANCE+"**
3. **Vérifier** le sélecteur de position :
   - "Premier numéro tiré"
   - "Dernier numéro tiré"

4. **Sélectionner "Premier numéro tiré"**
5. **Sélectionner un numéro** (ex: 7)
6. **Vérifier** :
   - Mise : 100 F
   - Gain potentiel : 9,000 F (100 × 90)

7. **Valider le pari**

**✅ Résultat attendu :**
- Position enregistrée
- Pari valide

---

### PHASE 9 : Test ANAGRAMME

1. **Revenir au tirage**
2. **Choisir "ANAGRAMME"**
3. **Sélectionner un numéro** (ex: 12)
4. **Vérifier** dans la grille :
   - Le numéro 12 affiche "(21)" en dessous
   - Indiquant que 12 ET 21 seront couverts

5. **Vérifier** le récapitulatif :
   - Numéro : 12
   - Gain potentiel : 1,000 F (100 × 10)

6. **Valider le pari**

**✅ Résultat attendu :**
- Indication du numéro inversé
- Pari enregistré

---

### PHASE 10 : Saisie des Résultats (Admin)

1. **Se reconnecter en tant qu'admin**
2. **Attendre que le tirage passe en statut "Résultats"**
   - Ou créer un tirage avec une date/heure passée

3. **Aller dans "Résultats en attente"**
4. **Cliquer sur "Saisir Résultats"**
5. **Vérifier** le modal :
   - Nom de l'opérateur
   - Date et heure du tirage
   - Champ pour 5 numéros

6. **Entrer 5 numéros gagnants** (ex: "5, 12, 23, 45, 67")
7. **Cliquer sur "Enregistrer et Distribuer les Gains"**

8. **Vérifier** :
   - Toast de succès
   - Tirage déplacé vers "Archives"
   - Statistiques affichées (participants, gagnants, total mises, total gains)

**✅ Résultat attendu :**
- 5 numéros enregistrés
- Gains calculés et distribués automatiquement
- Tous les types de paris évalués sur ces 5 numéros

---

### PHASE 11 : Vérification des Gains (Joueur)

1. **Se reconnecter en tant que joueur**
2. **Vérifier le "Solde des Gains"**
   - Si vous avez gagné avec NAP2 (5, 23) et que le tirage contenait ces numéros
   - Le gain devrait être : Mise × 500

3. **Vérifier les notifications de gains**
   - Cloche en haut à droite
   - Détails du gain

4. **Aller dans "Profil" → "Historique des Transactions"**
   - Vérifier la transaction de gain

**✅ Résultat attendu :**
- Gains calculés correctement selon le type de pari
- Solde des gains mis à jour
- Notifications affichées

---

### PHASE 12 : Écran Résultats

1. **Aller dans "Résultats" depuis le dashboard**
2. **Vérifier** l'affichage :
   - Calendrier pour sélectionner une date
   - Liste des tirages complétés

3. **Pour chaque tirage :**
   - Nom de l'opérateur et pays
   - Date et heure
   - **5 numéros gagnants** affichés dans des cercles
   - Statistiques : participants, gagnants, total mises, total gains

**✅ Résultat attendu :**
- Résultats groupés par opérateur
- 5 numéros gagnants clairement visibles
- Statistiques complètes

---

## 🎯 Scénarios de Test Spécifiques

### Scénario A : Plusieurs Joueurs, Même Tirage, Types Différents

**Objectif :** Vérifier que tous les types de paris fonctionnent sur le même tirage

1. **Admin crée 1 tirage** : "Lotto Kadoo - 31/10 à 14h"

2. **Joueur 1** parie NAP2 : 5, 23 (mise 1000 F)
3. **Joueur 2** parie NAP5 : 5, 12, 23, 45, 67 (mise 100 F)
4. **Joueur 3** parie PERMUTATION : 5, 12, 23, 45 (mise 100 F/combo)
5. **Joueur 4** parie BANKA : Base 5, Associés 12, 23 (mise 500 F)

6. **Admin saisit** : "5, 12, 23, 45, 67"

**✅ Résultats attendus :**
- Joueur 1 : **GAGNE** 500,000 F (a trouvé 5 et 23)
- Joueur 2 : **GAGNE** 10,000 F (a trouvé les 5 numéros)
- Joueur 3 : **GAGNE** plusieurs combinaisons (5-12, 5-23, 12-23, 5-45, 12-45, 23-45)
- Joueur 4 : **GAGNE** (base 5 présent + au moins 1 associé présent)

---

### Scénario B : Vérifier les Multiplicateurs Personnalisés

1. **Admin crée un tirage** avec des multiplicateurs modifiés :
   ```
   NAP2 : 1000 (au lieu de 500)
   NAP5 : 200000 (au lieu de 100000)
   ```

2. **Joueur parie NAP2** avec mise de 100 F
3. **Vérifier** gain potentiel : **100,000 F** (100 × 1000)

4. **Admin saisit les résultats** avec les numéros gagnants
5. **Vérifier** que le joueur reçoit **100,000 F** (et non 50,000 F)

**✅ Résultat attendu :**
- Multiplicateurs personnalisés appliqués correctement
- Gains calculés avec les bons multiplicateurs

---

## ⚠️ Points de Vigilance

### 1. Pas de Mention de "2naps", "3naps", "5naps"
**Vérifier** dans TOUTE l'application qu'il n'y a AUCUNE mention de ces termes.

### 2. Toujours 5 Numéros Tirés
**Vérifier** que l'admin doit TOUJOURS entrer 5 numéros (ni plus, ni moins).

### 3. Même Tirage, Plusieurs Types
**Vérifier** que plusieurs joueurs peuvent parier différemment sur le MÊME tirage.

### 4. Calcul des Gains
**Vérifier** que chaque type de pari a sa propre logique :
- NAP1-NAP5 : Tous les numéros doivent être trouvés
- PERMUTATION : Au moins 1 combinaison gagnante
- BANKA : Base + au moins 1 associé
- CHANCE+ : Numéro en position exacte
- ANAGRAMME : Numéro OU son inversé

---

## 📊 Checklist Finale

- [ ] Admin peut créer des tirages par opérateur (5 choix)
- [ ] Aucune mention de "2naps/3naps/5naps" dans l'interface
- [ ] Dashboard affiche les tirages par opérateur
- [ ] Écran de sélection montre 9 types de paris
- [ ] Tous les types de paris fonctionnent correctement
- [ ] Les 5 numéros gagnants sont utilisés pour tous les types
- [ ] Calcul des gains correct pour chaque type
- [ ] Multiplicateurs personnalisables par l'admin
- [ ] Écran résultats affiche les opérateurs et 5 numéros
- [ ] Historique des transactions correct

---

## 🐛 Problèmes Connus / À Surveiller

1. **Migration des anciennes données**
   - Si l'application contenait d'anciens paris avec gameId
   - Vérifier que ça ne casse rien

2. **Performance**
   - Avec beaucoup de tirages, vérifier que le dashboard charge rapidement

3. **Notifications**
   - Vérifier que les notifications de gains affichent le bon nom d'opérateur

---

## ✅ Validation Finale

Une fois TOUS les tests passés avec succès :

1. **Tester avec des données réelles**
   - Créer 10+ tirages
   - Placer 50+ paris
   - Saisir les résultats
   - Vérifier l'intégrité des données

2. **Tester la navigation complète**
   - Dashboard → Tirage → Type de pari → Pari → Résultats → Retour

3. **Tester les cas limites**
   - Solde insuffisant
   - Tirage expiré
   - Numéros invalides dans les résultats
   - Etc.

---

**Date du Guide :** 29 Octobre 2025  
**Version Système :** 2.0 - Opérateurs  
**Status :** ✅ Prêt pour Tests Complets
