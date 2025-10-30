# 🔄 GUIDE DE MIGRATION DES DONNÉES - LocalStorage → Backend

Ce document explique exactement comment migrer les données actuellement stockées en localStorage vers la base de données backend.

---

## 📦 VUE D'ENSEMBLE DES DONNÉES ACTUELLES

### Structure localStorage actuelle:

```javascript
localStorage.keys = [
  'loto_happy_users',              // Tous les utilisateurs (joueurs + revendeurs)
  'loto_happy_draws',              // Tous les tirages
  'loto_happy_tickets',            // Tous les paris
  'loto_happy_withdrawal_requests', // Demandes de retrait
  'loto_happy_win_notifications',  // Notifications de gains
  'lottoHappyUser',                // Session utilisateur actuel
  'lottoHappyAdmins',              // Administrateurs
  'theme'                          // Préférence de thème (à garder local)
];
```

---

## 1️⃣ MIGRATION: USERS

### Lecture localStorage:

```javascript
const usersJSON = localStorage.getItem('loto_happy_users');
const users = usersJSON ? JSON.parse(usersJSON) : [];
```

### Format actuel:

```javascript
{
  id: "user_1730217600000_abc123",
  isLoggedIn: true,                    // ⚠️ À SUPPRIMER (géré par session backend)
  username: "JohnDoe",
  phoneNumber: "+22890123456",
  email: "john@example.com",
  password: "hashedPassword123",       // ⚠️ Re-hasher avec bcrypt/argon2
  authMethod: "password",              // OK
  role: "player",                      // OK
  balanceGame: 5000,                   // OK
  balanceWinnings: 12500,              // OK
  tokenBalance: undefined,             // Pour revendeurs seulement
  dailyRechargeTotal: undefined,       // Pour revendeurs seulement
  dailyTransactionsCount: undefined,   // Pour revendeurs seulement
  transactionHistory: [],              // Pour revendeurs seulement
  playerTransactionHistory: [          // Pour joueurs seulement
    {
      id: "trans_123",
      type: "RECHARGE",
      description: "...",
      amount: 5000,
      balanceAfter: 5000,
      date: "2025-10-29T14:30:00.000Z",
      metadata: { ... }
    }
  ],
  status: "active"                     // OK
}
```

### Transformation pour backend:

```javascript
function transformUser(localUser) {
  // Base commune
  const baseUser = {
    id: localUser.id,
    username: localUser.username,
    phoneNumber: localUser.phoneNumber,
    email: localUser.email,
    password: localUser.password,      // ⚠️ Re-hasher !
    authMethod: localUser.authMethod || 'password',
    role: localUser.role,
    status: localUser.status || 'active',
    createdAt: extractCreatedAt(localUser.id),
    lastLogin: new Date().toISOString()
  };
  
  // Spécifique joueur
  if (localUser.role === 'player') {
    return {
      ...baseUser,
      balanceGame: localUser.balanceGame || 0,
      balanceWinnings: localUser.balanceWinnings || 0,
      playerTransactionHistory: localUser.playerTransactionHistory || []
    };
  }
  
  // Spécifique revendeur
  if (localUser.role === 'reseller') {
    return {
      ...baseUser,
      balanceGame: 0,
      balanceWinnings: 0,
      tokenBalance: localUser.tokenBalance || 0,
      dailyRechargeTotal: localUser.dailyRechargeTotal || 0,
      dailyTransactionsCount: localUser.dailyTransactionsCount || 0,
      transactionHistory: localUser.transactionHistory || []
    };
  }
  
  return baseUser;
}

function extractCreatedAt(id) {
  // Format ID: "user_1730217600000_abc123"
  const parts = id.split('_');
  if (parts[1] && !isNaN(parts[1])) {
    return new Date(parseInt(parts[1])).toISOString();
  }
  return new Date().toISOString();
}
```

### Script de migration:

```javascript
async function migrateUsers() {
  const usersJSON = localStorage.getItem('loto_happy_users');
  const localUsers = usersJSON ? JSON.parse(usersJSON) : [];
  
  console.log(`📦 Migration de ${localUsers.length} utilisateurs...`);
  
  for (const localUser of localUsers) {
    try {
      const transformedUser = transformUser(localUser);
      
      // Envoyer au backend
      const response = await fetch('/api/migration/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Migration-Key': 'SECRET_MIGRATION_KEY'
        },
        body: JSON.stringify(transformedUser)
      });
      
      if (response.ok) {
        console.log(`✅ User ${transformedUser.username} migré`);
      } else {
        console.error(`❌ Erreur pour ${transformedUser.username}:`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Erreur migration user ${localUser.id}:`, error);
    }
  }
  
  console.log('✅ Migration users terminée');
}
```

---

## 2️⃣ MIGRATION: ADMINS

### Lecture localStorage:

```javascript
const adminsJSON = localStorage.getItem('lottoHappyAdmins');
const admins = adminsJSON ? JSON.parse(adminsJSON) : [];
```

### Format actuel:

```javascript
{
  id: "admin_1730000000000_admin1",
  username: "AdminSuper",
  email: "admin@lotohappy.com",
  password: "hashedPassword456",       // ⚠️ Re-hasher
  role: "Super Admin",                 // OK
  status: "Actif",                     // OK
  lastLogin: "2025-10-29T12:00:00.000Z",
  createdAt: "2025-10-01T00:00:00.000Z"
}
```

### Transformation:

```javascript
function transformAdmin(localAdmin) {
  return {
    id: localAdmin.id,
    username: localAdmin.username,
    email: localAdmin.email,
    password: localAdmin.password,     // ⚠️ Re-hasher !
    role: localAdmin.role,
    status: localAdmin.status,
    lastLogin: localAdmin.lastLogin || new Date().toISOString(),
    createdAt: localAdmin.createdAt || extractCreatedAt(localAdmin.id)
  };
}
```

---

## 3️⃣ MIGRATION: DRAWS

### Lecture localStorage:

```javascript
const drawsJSON = localStorage.getItem('loto_happy_draws');
const draws = drawsJSON ? JSON.parse(drawsJSON) : [];
```

### Format actuel:

```javascript
{
  id: "draw_1730217600000_def456",
  operatorId: "togo-kadoo",            // OK
  date: "2025-10-30",                  // OK
  time: "18:00",                       // OK
  status: "upcoming",                  // OK
  multipliers: {                       // OK
    NAP1: 10,
    NAP2: 500,
    NAP3: 5000,
    NAP4: 25000,
    NAP5: 100000,
    PERMUTATION: 250,
    BANKA: 150,
    CHANCE_PLUS: 2000,
    ANAGRAMME: 10
  },
  winningNumbers: [],                  // OK (vide si pas encore tiré)
  createdAt: "2025-10-29T15:30:00.000Z",
  createdBy: "admin_1730000000000_admin1"
}
```

### Transformation:

```javascript
function transformDraw(localDraw) {
  // Aucune transformation nécessaire, format déjà compatible !
  return localDraw;
}
```

### Script de migration:

```javascript
async function migrateDraws() {
  const drawsJSON = localStorage.getItem('loto_happy_draws');
  const localDraws = drawsJSON ? JSON.parse(drawsJSON) : [];
  
  console.log(`📦 Migration de ${localDraws.length} tirages...`);
  
  for (const localDraw of localDraws) {
    try {
      const response = await fetch('/api/migration/draws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Migration-Key': 'SECRET_MIGRATION_KEY'
        },
        body: JSON.stringify(localDraw)
      });
      
      if (response.ok) {
        console.log(`✅ Draw ${localDraw.id} migré`);
      } else {
        console.error(`❌ Erreur pour draw ${localDraw.id}:`, await response.text());
      }
    } catch (error) {
      console.error(`❌ Erreur migration draw ${localDraw.id}:`, error);
    }
  }
  
  console.log('✅ Migration draws terminée');
}
```

---

## 4️⃣ MIGRATION: TICKETS

### Lecture localStorage:

```javascript
const ticketsJSON = localStorage.getItem('loto_happy_tickets');
const tickets = ticketsJSON ? JSON.parse(ticketsJSON) : [];
```

### Format actuel:

```javascript
{
  id: "ticket_1730220000000_abc123",
  userId: "user_1730217600000_abc123",
  username: "JohnDoe",
  drawId: "draw_1730217600000_def456",
  numbers: "12, 34",                   // OK (string)
  betAmount: 1000,                     // OK
  purchaseDate: "2025-10-29T16:00:00.000Z",
  status: "pending",                   // OK
  winAmount: undefined,                // OK (undefined si pas encore gagné)
  betType: "NAP2",                     // OK
  baseNumber: undefined,               // Pour BANKA uniquement
  associatedNumbers: undefined,        // Pour BANKA uniquement
  position: undefined,                 // Pour CHANCE_PLUS uniquement
  combinations: undefined              // Pour PERMUTATION uniquement
}
```

### Transformation:

```javascript
function transformTicket(localTicket) {
  // Aucune transformation nécessaire, format déjà compatible !
  return {
    ...localTicket,
    // S'assurer que les champs optionnels sont présents
    status: localTicket.status || 'pending',
    winAmount: localTicket.winAmount || 0,
    betType: localTicket.betType || 'NAP2'
  };
}
```

---

## 5️⃣ MIGRATION: WITHDRAWAL REQUESTS

### Lecture localStorage:

```javascript
const withdrawalsJSON = localStorage.getItem('loto_happy_withdrawal_requests');
const withdrawals = withdrawalsJSON ? JSON.parse(withdrawalsJSON) : [];
```

### Format actuel:

```javascript
{
  id: "withdraw_1730226000000_wd1",
  userId: "user_1730217600000_abc123",
  username: "JohnDoe",
  phoneNumber: "+22890123456",
  amount: 50000,
  provider: "TMoney",
  withdrawalPhoneNumber: "+22890123456",
  status: "pending",
  requestDate: "2025-10-29T17:20:00.000Z",
  processedDate: undefined,
  processedBy: undefined
}
```

### Transformation:

```javascript
function transformWithdrawal(localWithdrawal) {
  // Format déjà compatible !
  return localWithdrawal;
}
```

---

## 6️⃣ MIGRATION: WIN NOTIFICATIONS

### Lecture localStorage:

```javascript
const notificationsJSON = localStorage.getItem('loto_happy_win_notifications');
const notifications = notificationsJSON ? JSON.parse(notificationsJSON) : [];
```

### Format actuel:

```javascript
{
  id: 1,                               // ⚠️ Nombre → String
  userId: "user_1730217600000_abc123",
  drawId: "draw_1730217600000_def456",
  operatorName: "Lotto Kadoo",
  drawDate: "2025-10-30",
  winningNumbers: [12, 34, 56, 78, 90],
  playerNumbers: "12, 34",
  matchCount: 2,
  winAmount: 500000,
  timestamp: "2025-10-30T18:15:00.000Z",
  read: false
}
```

### Transformation:

```javascript
function transformNotification(localNotif) {
  return {
    ...localNotif,
    id: `notif_${localNotif.id}_${Date.now()}` // Convertir number → string UUID
  };
}
```

---

## 📋 SCRIPT DE MIGRATION COMPLET

### Frontend (à exécuter dans la console du navigateur):

```javascript
/**
 * SCRIPT DE MIGRATION COMPLÈTE
 * À exécuter dans la console du navigateur (F12)
 */

const BACKEND_URL = 'https://api.lotohappy.com'; // Remplacer par votre URL
const MIGRATION_KEY = 'VOTRE_CLE_SECRETE_MIGRATION'; // Clé de sécurité

async function fullMigration() {
  console.log('🚀 DÉBUT DE LA MIGRATION COMPLÈTE');
  console.log('================================\n');
  
  const results = {
    users: { success: 0, errors: 0 },
    admins: { success: 0, errors: 0 },
    draws: { success: 0, errors: 0 },
    tickets: { success: 0, errors: 0 },
    withdrawals: { success: 0, errors: 0 },
    notifications: { success: 0, errors: 0 }
  };
  
  // 1. Migrer les USERS
  console.log('1️⃣ Migration des UTILISATEURS...');
  try {
    const usersJSON = localStorage.getItem('loto_happy_users');
    const users = usersJSON ? JSON.parse(usersJSON) : [];
    
    for (const user of users) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/migration/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Migration-Key': MIGRATION_KEY
          },
          body: JSON.stringify(transformUser(user))
        });
        
        if (response.ok) {
          results.users.success++;
          console.log(`  ✅ ${user.username}`);
        } else {
          results.users.errors++;
          console.error(`  ❌ ${user.username}:`, await response.text());
        }
      } catch (error) {
        results.users.errors++;
        console.error(`  ❌ ${user.username}:`, error.message);
      }
    }
    console.log(`✅ Users: ${results.users.success} OK, ${results.users.errors} erreurs\n`);
  } catch (error) {
    console.error('❌ Erreur migration users:', error);
  }
  
  // 2. Migrer les ADMINS
  console.log('2️⃣ Migration des ADMINISTRATEURS...');
  try {
    const adminsJSON = localStorage.getItem('lottoHappyAdmins');
    const admins = adminsJSON ? JSON.parse(adminsJSON) : [];
    
    for (const admin of admins) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/migration/admins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Migration-Key': MIGRATION_KEY
          },
          body: JSON.stringify(transformAdmin(admin))
        });
        
        if (response.ok) {
          results.admins.success++;
          console.log(`  ✅ ${admin.username}`);
        } else {
          results.admins.errors++;
          console.error(`  ❌ ${admin.username}:`, await response.text());
        }
      } catch (error) {
        results.admins.errors++;
        console.error(`  ❌ ${admin.username}:`, error.message);
      }
    }
    console.log(`✅ Admins: ${results.admins.success} OK, ${results.admins.errors} erreurs\n`);
  } catch (error) {
    console.error('❌ Erreur migration admins:', error);
  }
  
  // 3. Migrer les DRAWS
  console.log('3️⃣ Migration des TIRAGES...');
  try {
    const drawsJSON = localStorage.getItem('loto_happy_draws');
    const draws = drawsJSON ? JSON.parse(drawsJSON) : [];
    
    for (const draw of draws) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/migration/draws`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Migration-Key': MIGRATION_KEY
          },
          body: JSON.stringify(draw)
        });
        
        if (response.ok) {
          results.draws.success++;
          console.log(`  ✅ ${draw.id}`);
        } else {
          results.draws.errors++;
          console.error(`  ❌ ${draw.id}:`, await response.text());
        }
      } catch (error) {
        results.draws.errors++;
        console.error(`  ❌ ${draw.id}:`, error.message);
      }
    }
    console.log(`✅ Draws: ${results.draws.success} OK, ${results.draws.errors} erreurs\n`);
  } catch (error) {
    console.error('❌ Erreur migration draws:', error);
  }
  
  // 4. Migrer les TICKETS
  console.log('4️⃣ Migration des TICKETS...');
  try {
    const ticketsJSON = localStorage.getItem('loto_happy_tickets');
    const tickets = ticketsJSON ? JSON.parse(ticketsJSON) : [];
    
    for (const ticket of tickets) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/migration/tickets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Migration-Key': MIGRATION_KEY
          },
          body: JSON.stringify(transformTicket(ticket))
        });
        
        if (response.ok) {
          results.tickets.success++;
          console.log(`  ✅ ${ticket.id}`);
        } else {
          results.tickets.errors++;
          console.error(`  ❌ ${ticket.id}:`, await response.text());
        }
      } catch (error) {
        results.tickets.errors++;
        console.error(`  ❌ ${ticket.id}:`, error.message);
      }
    }
    console.log(`✅ Tickets: ${results.tickets.success} OK, ${results.tickets.errors} erreurs\n`);
  } catch (error) {
    console.error('❌ Erreur migration tickets:', error);
  }
  
  // 5. Migrer les WITHDRAWALS
  console.log('5️⃣ Migration des DEMANDES DE RETRAIT...');
  try {
    const withdrawalsJSON = localStorage.getItem('loto_happy_withdrawal_requests');
    const withdrawals = withdrawalsJSON ? JSON.parse(withdrawalsJSON) : [];
    
    for (const withdrawal of withdrawals) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/migration/withdrawals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Migration-Key': MIGRATION_KEY
          },
          body: JSON.stringify(withdrawal)
        });
        
        if (response.ok) {
          results.withdrawals.success++;
          console.log(`  ✅ ${withdrawal.id}`);
        } else {
          results.withdrawals.errors++;
          console.error(`  ❌ ${withdrawal.id}:`, await response.text());
        }
      } catch (error) {
        results.withdrawals.errors++;
        console.error(`  ❌ ${withdrawal.id}:`, error.message);
      }
    }
    console.log(`✅ Withdrawals: ${results.withdrawals.success} OK, ${results.withdrawals.errors} erreurs\n`);
  } catch (error) {
    console.error('❌ Erreur migration withdrawals:', error);
  }
  
  // 6. Migrer les NOTIFICATIONS
  console.log('6️⃣ Migration des NOTIFICATIONS...');
  try {
    const notificationsJSON = localStorage.getItem('loto_happy_win_notifications');
    const notifications = notificationsJSON ? JSON.parse(notificationsJSON) : [];
    
    for (const notification of notifications) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/migration/notifications`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Migration-Key': MIGRATION_KEY
          },
          body: JSON.stringify(transformNotification(notification))
        });
        
        if (response.ok) {
          results.notifications.success++;
          console.log(`  ✅ ${notification.id}`);
        } else {
          results.notifications.errors++;
          console.error(`  ❌ ${notification.id}:`, await response.text());
        }
      } catch (error) {
        results.notifications.errors++;
        console.error(`  ❌ ${notification.id}:`, error.message);
      }
    }
    console.log(`✅ Notifications: ${results.notifications.success} OK, ${results.notifications.errors} erreurs\n`);
  } catch (error) {
    console.error('❌ Erreur migration notifications:', error);
  }
  
  // RÉSUMÉ FINAL
  console.log('\n================================');
  console.log('🎉 MIGRATION TERMINÉE !');
  console.log('================================');
  console.log('RÉSUMÉ:');
  console.log(`  Users:          ${results.users.success} ✅  ${results.users.errors} ❌`);
  console.log(`  Admins:         ${results.admins.success} ✅  ${results.admins.errors} ❌`);
  console.log(`  Draws:          ${results.draws.success} ✅  ${results.draws.errors} ❌`);
  console.log(`  Tickets:        ${results.tickets.success} ✅  ${results.tickets.errors} ❌`);
  console.log(`  Withdrawals:    ${results.withdrawals.success} ✅  ${results.withdrawals.errors} ❌`);
  console.log(`  Notifications:  ${results.notifications.success} ✅  ${results.notifications.errors} ❌`);
  console.log('================================\n');
  
  const totalSuccess = Object.values(results).reduce((sum, r) => sum + r.success, 0);
  const totalErrors = Object.values(results).reduce((sum, r) => sum + r.errors, 0);
  
  console.log(`📊 TOTAL: ${totalSuccess} succès, ${totalErrors} erreurs`);
  
  return results;
}

// Fonctions de transformation (copier depuis les sections précédentes)
function transformUser(user) { /* ... */ }
function transformAdmin(admin) { /* ... */ }
function transformTicket(ticket) { /* ... */ }
function transformNotification(notif) { /* ... */ }
function extractCreatedAt(id) { /* ... */ }

// EXÉCUTER LA MIGRATION
// fullMigration();
```

---

## 🔒 SÉCURITÉ DE LA MIGRATION

### Endpoint de migration (Backend):

```javascript
// Route protégée par clé secrète
app.post('/api/migration/:entity', async (req, res) => {
  const { entity } = req.params;
  const migrationKey = req.headers['x-migration-key'];
  
  // Vérifier la clé de migration
  if (migrationKey !== process.env.MIGRATION_SECRET_KEY) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized migration attempt'
    });
  }
  
  // Vérifier que la migration n'a pas déjà été faite
  const migrationStatus = await MigrationLog.findOne({ entity });
  if (migrationStatus && migrationStatus.completed) {
    return res.status(400).json({
      success: false,
      error: 'Migration already completed for this entity'
    });
  }
  
  try {
    // Traiter selon l'entité
    switch (entity) {
      case 'users':
        await User.create(req.body);
        break;
      case 'admins':
        await Admin.create(req.body);
        break;
      case 'draws':
        await Draw.create(req.body);
        break;
      case 'tickets':
        await Ticket.create(req.body);
        break;
      case 'withdrawals':
        await WithdrawalRequest.create(req.body);
        break;
      case 'notifications':
        await WinNotification.create(req.body);
        break;
      default:
        return res.status(400).json({ success: false, error: 'Invalid entity' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## ✅ CHECKLIST POST-MIGRATION

Après la migration complète, vérifier:

- [ ] Tous les users sont migrés avec les bons soldes
- [ ] Tous les admins peuvent se connecter
- [ ] Tous les tirages sont présents (upcoming, pending, completed)
- [ ] Tous les tickets sont liés aux bons users et draws
- [ ] Toutes les demandes de retrait sont présentes
- [ ] Toutes les notifications de gains sont visibles
- [ ] Les soldes correspondent entre localStorage et backend
- [ ] Les transactions sont cohérentes
- [ ] Aucune donnée en double
- [ ] Les IDs sont préservés (pour éviter les conflits)

---

## 🔄 PLAN DE BASCULEMENT

### Phase 1: Mode Hybride (localStorage + Backend)
```javascript
// Écrire dans les deux systèmes en parallèle
async function saveBet(bet) {
  // 1. Sauver dans localStorage (ancien système)
  const tickets = getTickets();
  tickets.push(bet);
  localStorage.setItem('loto_happy_tickets', JSON.stringify(tickets));
  
  // 2. Sauver dans le backend (nouveau système)
  await fetch('/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bet)
  });
}
```

### Phase 2: Mode Backend-First (Backend prioritaire)
```javascript
// Lire du backend, fallback sur localStorage
async function getBets() {
  try {
    const response = await fetch('/api/tickets/user/123');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend unavailable, using localStorage');
  }
  
  // Fallback sur localStorage
  const ticketsJSON = localStorage.getItem('loto_happy_tickets');
  return ticketsJSON ? JSON.parse(ticketsJSON) : [];
}
```

### Phase 3: Mode Backend-Only (Backend uniquement)
```javascript
// Supprimer tout le code localStorage
async function getBets() {
  const response = await fetch('/api/tickets/user/123');
  return await response.json();
}
```

---

## 📝 NOTES IMPORTANTES

### ⚠️ Points d'attention:

1. **Mots de passe**: Re-hasher TOUS les mots de passe avec bcrypt/argon2
2. **IDs**: Préserver les IDs existants pour éviter les conflits
3. **Timestamps**: Vérifier que toutes les dates sont en ISO 8601
4. **Soldes**: Double vérification des montants avant migration
5. **Transactions**: Migrer dans l'ordre chronologique
6. **Tests**: Tester sur environnement de dev avant prod
7. **Backup**: TOUJOURS faire un backup avant migration
8. **Rollback**: Prévoir un plan de retour arrière

### 📦 Export des données localStorage:

```javascript
// Exporter toutes les données en un fichier
function exportLocalStorageData() {
  const data = {
    users: JSON.parse(localStorage.getItem('loto_happy_users') || '[]'),
    admins: JSON.parse(localStorage.getItem('lottoHappyAdmins') || '[]'),
    draws: JSON.parse(localStorage.getItem('loto_happy_draws') || '[]'),
    tickets: JSON.parse(localStorage.getItem('loto_happy_tickets') || '[]'),
    withdrawals: JSON.parse(localStorage.getItem('loto_happy_withdrawal_requests') || '[]'),
    notifications: JSON.parse(localStorage.getItem('loto_happy_win_notifications') || '[]')
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `loto-happy-backup-${Date.now()}.json`;
  a.click();
  
  console.log('✅ Backup téléchargé');
}

// EXÉCUTER
// exportLocalStorageData();
```

---

**Fin du guide de migration - Version 1.0**

Ce guide couvre tous les aspects de la migration. Pour questions: référez-vous à BACKEND_SPECIFICATIONS.md et API_EXAMPLES.md.
