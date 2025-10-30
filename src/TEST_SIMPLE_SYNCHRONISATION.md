# 🧪 TEST SIMPLE - SYNCHRONISATION LOCALSTORAGE

## ✅ TOUTES LES DONNÉES FICTIVES ONT ÉTÉ SUPPRIMÉES

Tout est maintenant synchronisé via **localStorage**. Voici le test simple pour vérifier :

---

## 🎯 TEST EN 3 ÉTAPES

### ÉTAPE 1 : Créer un Tirage (Admin) 🔧

1. **Connexion Admin**
   - Numéro : `000000000000`
   - Mot de passe : `adminlotto`

2. **Panneau Admin → Gestion des Jeux**
   - Cliquer sur "Nouveau Tirage"
   - Sélectionner : `🎲 Togo - Loto Kadoo 5naps`
   - Date : Demain (ex: 2025-10-29)
   - Heure : 18:00
   - Cliquer "Créer le tirage"

3. **✅ Vérification**
   - Toast "Nouveau tirage créé avec succès"
   - Le tirage apparaît dans l'onglet "À Venir"

---

### ÉTAPE 2 : Vérifier côté Joueur 👤

1. **Se déconnecter de l'admin**

2. **Créer un compte joueur** (si nécessaire)
   - Nom : `TestJoueur228`
   - Numéro : `+22890123456` (TOGO)
   - Email : `test@test.com`
   - Mot de passe : `test123`

3. **Dashboard Joueur**
   - **✅ VÉRIFIER :** Le tirage "Loto Kadoo 5naps" apparaît
   - **✅ VÉRIFIER :** Date et heure affichées
   - **✅ VÉRIFIER :** Countdown actif

4. **Cliquer sur le jeu**
   - **✅ VÉRIFIER :** GameScreen s'ouvre
   - **✅ VÉRIFIER :** Infos du prochain tirage affichées

---

### ÉTAPE 3 : Placer un Pari 🎮

1. **Sélectionner 5 numéros** (ex: 5, 12, 23, 34, 45)

2. **Cliquer "Valider le Pari"**
   - **✅ VÉRIFIER :** Toast "Pari enregistré ! Numéros : 5, 12, 23, 34, 45"
   - **✅ VÉRIFIER :** Solde diminué de 500 F

3. **Profil → Onglet "Paris"**
   - **✅ VÉRIFIER :** Le pari apparaît
   - **✅ VÉRIFIER :** Tous les détails corrects

4. **Retour Admin → Gestion des Jeux**
   - **✅ VÉRIFIER :** Le tirage affiche "1 participant"

5. **Admin → Gestion Financière**
   - **✅ VÉRIFIER :** Stats affichent "Total Mises : 500 F"
   - **✅ VÉRIFIER :** Le pari apparaît dans l'historique

---

## ✅ CHECKLIST DE SYNCHRONISATION

### localStorage Keys à vérifier (F12 → Application → Local Storage)

1. **`loto_happy_draws`**
   - Doit contenir le tirage créé par l'admin
   - Format : `[{ id: 1, gameId: "loto-kadoo-5naps", ... }]`

2. **`loto_happy_tickets`**
   - Doit contenir le pari du joueur
   - Format : `[{ id: "ticket_...", userId: "...", numbers: "5, 12, 23, 34, 45", ... }]`

3. **`loto_happy_users`**
   - Doit contenir l'utilisateur avec le solde mis à jour
   - Le `balanceGame` doit avoir diminué de 500

---

## 🔍 VÉRIFICATIONS IMPORTANTES

### ✅ Dashboard Joueur
- Affiche UNIQUEMENT les tirages créés par l'admin
- PAS de données fictives
- Si aucun tirage → Message "Aucun tirage disponible"

### ✅ ResultsScreen
- Affiche UNIQUEMENT les tirages archivés (status: 'archived')
- PAS de données fictives
- Si aucun résultat → Message "Aucun résultat disponible"

### ✅ WinnerFeed
- Affiche UNIQUEMENT les vrais gagnants (tickets avec status: 'won')
- PAS de données fictives
- Si aucun gagnant → Message "Aucun gagnant pour le moment"

### ✅ AdminFinance
- Stats calculées depuis les vrais tickets
- Historique affiche les vrais paris
- PAS de demandes de retrait fictives (vide par défaut)

---

## 🐛 SI ÇA NE MARCHE PAS

### Problème : Le tirage n'apparaît pas chez le joueur

**Causes possibles :**
1. Le joueur est d'un autre pays (numéro commence par +229, +225, etc.)
2. Le gameId du tirage ne correspond pas

**Solution :**
1. Console (F12) : `localStorage.getItem('loto_happy_draws')`
2. Vérifier le `gameId` du tirage
3. Vérifier le `country` du tirage
4. S'assurer que le numéro du joueur commence par +228 (Togo)

### Problème : Le pari ne s'enregistre pas

**Causes possibles :**
1. Pas de tirage "upcoming" ou "pending" pour ce jeu
2. Solde insuffisant

**Solution :**
1. Console : `localStorage.getItem('loto_happy_draws')`
2. Vérifier qu'il y a un tirage avec `status: "upcoming"` pour ce gameId
3. Vérifier le solde du joueur

### Problème : Les stats admin sont à 0

**Causes possibles :**
1. Aucun pari n'a été placé
2. localStorage vide

**Solution :**
1. Placer au moins un pari
2. Console : `localStorage.getItem('loto_happy_tickets')`
3. Recharger la page Admin

---

## 🎉 RÉSULTAT ATTENDU

**Après ces 3 étapes :**

### Côté Joueur
- Dashboard affiche le tirage créé
- Le pari est enregistré
- Solde mis à jour
- Historique affiche le pari

### Côté Admin
- Tirage créé visible dans "À Venir"
- Nombre de participants = 1
- Stats : Total Mises = 500 F
- Historique affiche le pari

### localStorage
- `loto_happy_draws` : 1 tirage
- `loto_happy_tickets` : 1 ticket
- `loto_happy_users` : Solde joueur mis à jour

---

## 📝 NOTES IMPORTANTES

1. **Tout est synchronisé via localStorage** - PAS de données fictives
2. **Dashboard affiche UNIQUEMENT les tirages créés** - Si aucun tirage = vide
3. **Chaque pays voit SES jeux** - Détection automatique via numéro de téléphone
4. **Les stats sont réelles** - Calculées depuis les tickets et tirages

---

**Si ces 3 étapes fonctionnent, le système est 100% synchronisé ! 🎉**
