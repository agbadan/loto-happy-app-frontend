# 🐛 DEBUG - SOLDE DES GAINS À 0

## Diagnostic du Problème

Vous avez gagné **500,000 F** mais le "Solde des Gains" reste à **0 F**.

---

## 🔍 ÉTAPE 1 : Vérifier localStorage

Ouvrez **F12** → **Console** et exécutez ces commandes :

### 1. Vérifier l'utilisateur connecté
```javascript
const currentUser = JSON.parse(localStorage.getItem('lottoHappyUser'));
console.log('=== UTILISATEUR CONNECTÉ ===');
console.log('ID:', currentUser.id);
console.log('Username:', currentUser.username);
console.log('Solde Jeu:', currentUser.balanceGame);
console.log('Solde Gains:', currentUser.balanceWinnings);
console.log('Transactions:', currentUser.playerTransactionHistory);
```

### 2. Vérifier la base de données des utilisateurs
```javascript
const allUsers = JSON.parse(localStorage.getItem('loto_happy_users'));
const myUser = allUsers.find(u => u.id === currentUser.id);
console.log('=== MON COMPTE DANS LA BASE ===');
console.log('Solde Gains:', myUser.balanceWinnings);
console.log('Transactions:', myUser.playerTransactionHistory);
```

### 3. Vérifier les tickets
```javascript
const tickets = JSON.parse(localStorage.getItem('loto_happy_tickets'));
const myTickets = tickets.filter(t => t.userId === currentUser.id);
console.log('=== MES TICKETS ===');
myTickets.forEach(ticket => {
  console.log({
    gameName: ticket.gameName,
    numbers: ticket.numbers,
    status: ticket.status,
    winAmount: ticket.winAmount
  });
});
```

### 4. Vérifier les notifications de gain
```javascript
const notifications = JSON.parse(localStorage.getItem('loto_happy_win_notifications'));
const myNotifications = notifications.filter(n => n.userId === currentUser.id);
console.log('=== MES NOTIFICATIONS ===');
myNotifications.forEach(notif => {
  console.log({
    gameName: notif.gameName,
    winAmount: notif.winAmount,
    winningNumbers: notif.winningNumbers,
    playerNumbers: notif.playerNumbers,
    matchCount: notif.matchCount
  });
});
```

---

## ✅ RÉSULTAT ATTENDU

Si tout fonctionne correctement :

1. **`currentUser.balanceWinnings`** doit être **500000**
2. **`myUser.balanceWinnings`** (dans loto_happy_users) doit être **500000**
3. **`playerTransactionHistory`** doit contenir une transaction de type **"WIN"**
4. **`tickets`** doit avoir `status: "won"` et `winAmount: 500000`
5. **`notifications`** doit avoir une notification avec `winAmount: 500000`

---

## 🔧 SOLUTION 1 : Forcer la Synchronisation

Si `loto_happy_users` a le bon solde MAIS `lottoHappyUser` est à 0 :

```javascript
// Forcer la copie depuis loto_happy_users vers lottoHappyUser
const allUsers = JSON.parse(localStorage.getItem('loto_happy_users'));
const currentUser = JSON.parse(localStorage.getItem('lottoHappyUser'));
const myUser = allUsers.find(u => u.id === currentUser.id);

// Copier le solde
currentUser.balanceWinnings = myUser.balanceWinnings;
currentUser.playerTransactionHistory = myUser.playerTransactionHistory;

// Sauvegarder
localStorage.setItem('lottoHappyUser', JSON.stringify(currentUser));

// Recharger la page
location.reload();
```

---

## 🔧 SOLUTION 2 : Recalculer les Gains Manuellement

Si les tickets sont marqués "won" mais le solde n'a pas été crédité :

```javascript
const tickets = JSON.parse(localStorage.getItem('loto_happy_tickets'));
const currentUser = JSON.parse(localStorage.getItem('lottoHappyUser'));
const allUsers = JSON.parse(localStorage.getItem('loto_happy_users'));

// Calculer le total des gains
const myWinningTickets = tickets.filter(t => t.userId === currentUser.id && t.status === 'won');
const totalWinnings = myWinningTickets.reduce((sum, t) => sum + (t.winAmount || 0), 0);

console.log('Total gains calculé:', totalWinnings);

// Mettre à jour le solde
currentUser.balanceWinnings = totalWinnings;

// Mettre à jour dans loto_happy_users aussi
const userIndex = allUsers.findIndex(u => u.id === currentUser.id);
if (userIndex !== -1) {
  allUsers[userIndex].balanceWinnings = totalWinnings;
  localStorage.setItem('loto_happy_users', JSON.stringify(allUsers));
}

// Sauvegarder
localStorage.setItem('lottoHappyUser', JSON.stringify(currentUser));

// Recharger
location.reload();
```

---

## 🔧 SOLUTION 3 : Se Déconnecter et Reconnecter

Parfois le plus simple :

1. Se déconnecter
2. Se reconnecter
3. Le système devrait charger le bon solde depuis `loto_happy_users`

---

## 📋 CHECKLIST DE DIAGNOSTIC

Après avoir exécuté les commandes ci-dessus, cochez :

- [ ] `lottoHappyUser.balanceWinnings` = 500000 ?
- [ ] `loto_happy_users[mon_user].balanceWinnings` = 500000 ?
- [ ] Transaction WIN dans `playerTransactionHistory` ?
- [ ] Ticket avec `status: "won"` et `winAmount: 500000` ?
- [ ] Notification de gain avec `winAmount: 500000` ?

Si **TOUS** les ✓ sont cochés → Le problème est juste l'affichage (rafraîchir)
Si **CERTAINS** sont ✗ → Le crédit des gains n'a pas fonctionné

---

## 🚨 SI RIEN NE FONCTIONNE

Exécutez cette commande pour **TOUT RESET** :

```javascript
localStorage.clear();
location.reload();
```

⚠️ **ATTENTION** : Ceci efface TOUTES les données !

Ensuite refaites le test complet :
1. Admin crée un tirage
2. Joueur parie
3. Admin saisit résultats
4. Joueur vérifie son solde

---

**Exécutez les commandes et dites-moi ce que vous trouvez !**
