# ✅ TEST RAPIDE - CORRECTION PERSISTANCE REVENDEURS

## 🎯 OBJECTIF
Vérifier que les revendeurs conservent leurs modifications après déconnexion/reconnexion.

---

## 🧹 ÉTAPE 0 : NETTOYAGE (Recommandé)

```javascript
// Ouvrir la console (F12) et exécuter :
window.debugAuth.clearAllData()
// Puis rafraîchir la page (F5)
```

---

## 📋 TEST PRINCIPAL

### 1️⃣ **Connexion Revendeur**

- Code pays : `+228`
- Numéro : `990102030`
- Cliquez "Continuer"
- Mot de passe : `Revendeur1`
- Cliquez "Se connecter"

**✅ VÉRIFICATION** :
- Redirection vers Dashboard Revendeur
- Header : "Lotto Happy" + "Espace Revendeurs"
- **Solde de Jetons : 1 500 000 F**

---

### 2️⃣ **Créer un Joueur de Test**

- Se déconnecter du revendeur
- Code pays : `+228`
- Numéro : `11111111`
- Username : `PlayerTest`
- Mot de passe : `test123`
- S'inscrire

**✅ VÉRIFICATION** :
- Compte créé
- Solde initial : 1 000 F

---

### 3️⃣ **Recharger le Joueur (1ère fois)**

- Se déconnecter du joueur
- Se reconnecter comme revendeur (`+228` `990102030` / `Revendeur1`)
- Dans "Rechercher un joueur" : `22811111111` ou `PlayerTest`
- Montant : `5000`
- Cliquer "Créditer le compte"

**✅ VÉRIFICATION** :
- Message : "✅ Le compte de PlayerTest a été crédité de 5 000 F CFA"
- **Solde de Jetons : 1 495 000 F** (1 500 000 - 5 000)
- Total Rechargé Aujourd'hui : 5 000 F
- Transactions Aujourd'hui : 1
- Historique : 1 transaction visible

---

### 4️⃣ **Recharger à Nouveau (2ème fois)**

- Rechercher : `PlayerTest`
- Montant : `10000`
- Cliquer "Créditer le compte"

**✅ VÉRIFICATION** :
- **Solde de Jetons : 1 485 000 F** (1 495 000 - 10 000)
- Total Rechargé Aujourd'hui : 15 000 F
- Transactions Aujourd'hui : 2
- Historique : 2 transactions

---

### 5️⃣ **TEST CRITIQUE : Déconnexion/Reconnexion**

1. **Cliquer sur l'avatar** en haut à droite
2. Cliquer "Se déconnecter"
3. **Se reconnecter** :
   - Code pays : `+228`
   - Numéro : `990102030`
   - Mot de passe : `Revendeur1`

**✅ VÉRIFICATION CRITIQUE** :
- **Solde de Jetons : 1 485 000 F** ← PAS 1 500 000 F !
- Total Rechargé Aujourd'hui : 15 000 F ← Conservé !
- Transactions Aujourd'hui : 2 ← Conservé !
- Historique : 2 transactions ← Conservé !

**🎉 SI TOUT CORRESPOND = PROBLÈME RÉSOLU !**

---

### 6️⃣ **Vérification Côté Joueur**

- Se déconnecter du revendeur
- Se connecter comme joueur :
  - Code pays : `+228`
  - Numéro : `11111111`
  - Mot de passe : `test123`

**✅ VÉRIFICATION** :
- Solde de Jeu : **16 000 F** (1 000 initial + 5 000 + 10 000)

---

## 🔍 VÉRIFICATION AVANCÉE (Console)

### Voir l'état des revendeurs :
```javascript
window.debugAuth.showAllResellers()
```

**Sortie attendue** :
```
=== TOUS LES REVENDEURS ===
Nombre total: 5

1. GREGOIRE_RT
   Téléphone: 228990102030
   Jetons: 1485000          ← Modifié !
   Rechargé Aujourd'hui: 15000  ← Modifié !
   Transactions: 2          ← Modifié !

2. MAISON_LOTO
   Téléphone: 229660102030
   Jetons: 2000000          ← Inchangé (pas encore utilisé)
   Rechargé Aujourd'hui: 0
   Transactions: 0
...
```

### Voir les données brutes :
```javascript
JSON.parse(localStorage.getItem('lottoHappyAllResellers'))
```

---

## 🐛 SI ÇA NE MARCHE PAS

### Symptôme : Le solde revient à 1 500 000 F
```javascript
// 1. Vérifier si les données sont sauvegardées
localStorage.getItem('lottoHappyAllResellers')

// Si null ou undefined → Problème d'initialisation
// Si contient des données → Vérifier le contenu

// 2. Effacer et recommencer
window.debugAuth.clearAllData()
// Puis rafraîchir (F5) et refaire le test
```

### Symptôme : Historique vide après reconnexion
```javascript
// Vérifier l'utilisateur actuel
window.debugAuth.showCurrentUser()

// Devrait montrer :
// - Jetons: 1485000
// - Rechargé Aujourd'hui: 15000
// - Transactions: 2
```

---

## 📊 TABLEAU DE SUIVI

| Étape | Solde Jetons | Total Rechargé | Transactions | Status |
|-------|--------------|----------------|--------------|--------|
| Connexion initiale | 1 500 000 F | 0 F | 0 | ⏳ |
| Après 1er rechargement | 1 495 000 F | 5 000 F | 1 | ⏳ |
| Après 2ème rechargement | 1 485 000 F | 15 000 F | 2 | ⏳ |
| **Après reconnexion** | **1 485 000 F** | **15 000 F** | **2** | **✅ CRITIQUE** |

---

## ✅ CRITÈRES DE SUCCÈS

- ✅ Les modifications persistent après déconnexion
- ✅ Le solde de jetons est conservé
- ✅ Le total rechargé est conservé
- ✅ L'historique est conservé
- ✅ Les autres revendeurs gardent leurs valeurs initiales

---

## 🎯 TESTS SUPPLÉMENTAIRES (Optionnels)

### Test A : Changement de Mot de Passe
1. Connecté comme revendeur
2. Avatar → Changer le mot de passe
3. Ancien : `Revendeur1` → Nouveau : `Revendeur1New`
4. Déconnecter et reconnecter avec nouveau mot de passe
5. ✅ Solde et historique toujours conservés

### Test B : Multiple Revendeurs
1. Connecté comme GREGOIRE_RT → Recharger 5 000 F
2. Se déconnecter
3. Se connecter comme MAISON_LOTO (+229 660102030 / Revendeur2)
4. Recharger 3 000 F
5. Se déconnecter et reconnecter comme GREGOIRE_RT
6. ✅ Son solde doit être 1 495 000 F (pas 1 500 000 F)

### Test C : Longue Session
1. Faire 10 rechargements différents
2. Se déconnecter
3. Se reconnecter
4. ✅ Tous les 10 rechargements doivent être dans l'historique

---

## 🎉 RÉSULTAT ATTENDU

**AVANT LE FIX** :
```
Connexion → Solde: 1 500 000 F
Rechargement -5 000 F → Solde: 1 495 000 F
Déconnexion
Reconnexion → Solde: 1 500 000 F ❌ RÉINITIALISÉ
```

**APRÈS LE FIX** :
```
Connexion → Solde: 1 500 000 F
Rechargement -5 000 F → Solde: 1 495 000 F
Déconnexion
Reconnexion → Solde: 1 495 000 F ✅ CONSERVÉ
```

---

**🎊 Si tous les tests passent, le problème est résolu !**
