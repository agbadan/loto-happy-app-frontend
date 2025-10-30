# 🧪 GUIDE DE TEST - SYSTÈME D'AUTHENTIFICATION LOTTO HAPPY

## 🔧 FONCTIONS DE DÉBOGAGE

Ouvrez la console du navigateur (F12) et utilisez ces commandes :

```javascript
// Voir tous les joueurs enregistrés
window.debugAuth.showAllPlayers()

// Voir l'utilisateur actuellement connecté
window.debugAuth.showCurrentUser()

// Effacer toutes les données (réinitialisation complète)
window.debugAuth.clearAllData()
```

---

## ✅ TEST COMPLET DU SYSTÈME

### **ÉTAPE 1 : Nettoyage Initial**
```javascript
window.debugAuth.clearAllData()
```
Puis rafraîchir la page (F5)

---

### **ÉTAPE 2 : Créer un Compte Joueur**

1. Sur l'écran de connexion :
   - Code pays : `+228` (Togo)
   - Numéro : `12345678`
   - Cliquez sur "Continuer"

2. Écran d'inscription :
   - Username : `TestPlayer`
   - Mot de passe : `test123`
   - Confirmez : `test123`
   - Cliquez sur "S'inscrire"

3. ✅ **VÉRIFICATION** :
   - Vous devriez être redirigé vers le Dashboard
   - Solde de Jeu : **1 000 F CFA** (bonus de bienvenue)
   - Solde des Gains : **0 F CFA**

4. Dans la console :
```javascript
window.debugAuth.showCurrentUser()
// Devrait afficher :
// Username: TestPlayer
// Téléphone: 22812345678  ← IMPORTANT : sans le "+"
// Rôle: player
// Connecté: true
// Solde Jeu: 1000
```

---

### **ÉTAPE 3 : Test de Déconnexion**

1. Cliquez sur l'avatar en haut à droite
2. Cliquez sur "Se déconnecter"
3. ✅ **VÉRIFICATION** : Retour à l'écran de connexion

---

### **ÉTAPE 4 : Test de Reconnexion (LE PLUS IMPORTANT)**

1. Sur l'écran de connexion :
   - Code pays : `+228`
   - Numéro : `12345678`
   - Cliquez sur "Continuer"

2. ✅ **VÉRIFICATION CRITIQUE** :
   - Vous devriez être redirigé vers l'**écran de mot de passe**
   - PAS vers l'écran d'inscription !

3. Écran de mot de passe :
   - Mot de passe : `test123`
   - Cliquez sur "Se connecter"

4. ✅ **VÉRIFICATION** :
   - Vous devriez être redirigé vers le Dashboard
   - Solde de Jeu : **1 000 F CFA** (inchangé)
   - Message : "Connexion réussie ! Bienvenue 👋"

---

### **ÉTAPE 5 : Connexion Revendeur**

1. Déconnectez-vous si connecté
2. Sur l'écran de connexion :
   - Code pays : `+228`
   - Numéro : `990102030`
   - Cliquez sur "Continuer"

3. Écran de mot de passe :
   - Mot de passe : `Revendeur1`
   - Cliquez sur "Se connecter"

4. ✅ **VÉRIFICATION** :
   - Vous devriez être redirigé vers le **Dashboard Revendeur**
   - Header : "Lotto Happy" + "Espace Revendeurs"
   - Solde de Jetons : **1 500 000 F**
   - Avatar cliquable en haut à droite

---

### **ÉTAPE 6 : Test du Profil Revendeur**

1. Cliquez sur l'**avatar** en haut à droite
2. ✅ **VÉRIFICATION** :
   - Modal "Paramètres du Compte" s'ouvre
   - Username : GREGOIRE_RT
   - Téléphone : +228990102030
   - Rôle : Revendeur Agréé

3. Testez le changement de mot de passe :
   - Cliquez sur "Changer le mot de passe"
   - Ancien : `Revendeur1`
   - Nouveau : `Revendeur1New`
   - Confirmez : `Revendeur1New`
   - Cliquez sur "Confirmer"
   - ✅ Message : "Mot de passe modifié avec succès !"

4. Fermez la modal et déconnectez-vous
5. Reconnectez-vous avec le nouveau mot de passe : `Revendeur1New`
6. ✅ **VÉRIFICATION** : Connexion réussie

---

### **ÉTAPE 7 : Test du Rechargement Joueur (RÉEL)**

1. Connecté en tant que revendeur
2. Dans "Rechercher un joueur", tapez : `22812345678`
   (ou simplement `TestPlayer`)
3. Montant : `5000`
4. Cliquez sur "Créditer le compte"

5. ✅ **VÉRIFICATION** :
   - Message : "✅ Le compte de TestPlayer a été crédité de 5 000 F CFA"
   - Solde de Jetons : **1 495 000 F** (1 500 000 - 5 000)
   - Total Rechargé Aujourd'hui : **5 000 F**
   - Transactions Aujourd'hui : **1**
   - Une transaction apparaît dans l'historique

---

### **ÉTAPE 8 : Vérification Côté Joueur**

1. Déconnectez-vous du revendeur
2. Reconnectez-vous avec le compte `TestPlayer`
   - Code pays : `+228`
   - Numéro : `12345678`
   - Mot de passe : `test123`

3. ✅ **VÉRIFICATION FINALE** :
   - Solde de Jeu : **6 000 F CFA** (1 000 initial + 5 000 crédités)
   - Solde des Gains : **0 F CFA**

---

## 🎯 POINTS CRITIQUES À VÉRIFIER

### ✅ Numéros de Téléphone
- Les numéros sont stockés **SANS** le "+" : `22812345678`
- La recherche fonctionne avec ou sans le "+" : `+22812345678` ou `22812345678`
- Le username fonctionne aussi : `TestPlayer`

### ✅ Synchronisation
- Quand un joueur est crédité, son solde est mis à jour dans :
  - La liste globale (`ALL_PLAYERS_KEY`)
  - Sa session actuelle (s'il est connecté)

### ✅ Persistance
- Les joueurs restent dans `localStorage` après déconnexion
- Les revendeurs sont en dur dans le code (constante `RESELLERS`)

---

## 🐛 RÉSOLUTION DE PROBLÈMES

### Problème : "Joueur introuvable"
```javascript
// Vérifier que le joueur existe
window.debugAuth.showAllPlayers()
// Le numéro doit être sans "+" : 22812345678
```

### Problème : "Le joueur doit s'inscrire à nouveau"
```javascript
// Vérifier les données
window.debugAuth.showAllPlayers()
// Si la liste est vide → le problème est résolu maintenant
// Si le numéro a un "+", effacer et recréer :
window.debugAuth.clearAllData()
```

### Problème : "Le solde ne se synchronise pas"
```javascript
// Vérifier le joueur dans la liste
window.debugAuth.showAllPlayers()
// Puis vérifier l'utilisateur actuel
window.debugAuth.showCurrentUser()
// Les deux doivent avoir le même solde
```

---

## 📋 COMPTES DE TEST

### Revendeurs (en dur) :

| Nom | Téléphone | Mot de passe | Jetons |
|-----|-----------|--------------|--------|
| GREGOIRE_RT | +228 99 01 02 030 | Revendeur1 | 1 500 000 F |
| MAISON_LOTO | +229 66 01 02 030 | Revendeur2 | 2 000 000 F |
| CHANCE_PLUS | +225 07 01 02 030 | Revendeur3 | 1 800 000 F |
| GOLDEN_LOTO | +233 24 01 02 030 | Revendeur4 | 2 500 000 F |
| MEGA_CHANCE | +226 55 01 02 030 | Revendeur5 | 1 200 000 F |

### Joueurs (créés dynamiquement) :

Créez vos propres comptes de test avec n'importe quel numéro !

---

## ✅ SYSTÈME COMPLÈTEMENT FONCTIONNEL

Le système est maintenant :
- ✅ **Cohérent** : Les numéros sont stockés sans "+"
- ✅ **Persistant** : Les joueurs restent après déconnexion
- ✅ **Synchronisé** : Les soldes sont toujours à jour
- ✅ **Réel** : Les revendeurs créditent vraiment les joueurs
- ✅ **Complet** : Profils, changement de mot de passe, historique

🎉 **Bon test !**
