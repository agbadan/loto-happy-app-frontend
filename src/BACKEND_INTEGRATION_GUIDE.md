# 🔄 GUIDE D'INTÉGRATION BACKEND - EN COURS

**Date de début :** 30 Octobre 2025  
**Backend URL :** `https://together-fresh-alien.ngrok-free.app`  
**Statut :** 🟡 EN COURS

---

## ✅ ÉTAPES COMPLÉTÉES

### 1. Configuration de base
- [x] Création du fichier `.env` avec `REACT_APP_API_BASE_URL`
- [x] Création de `/utils/apiClient.ts` - Client HTTP centralisé
  - Gestion automatique du token JWT
  - Gestion des erreurs standardisée
  - Helpers pour GET, POST, PUT, DELETE

### 2. Refactorisation Auth (`/utils/authAPI.ts`)
- [x] Création de `/utils/authAPI.ts` avec toutes les fonctions API
- [x] `registerUser()` → POST /api/auth/register
- [x] `loginUser()` → POST /api/auth/login (form-urlencoded)
- [x] `loginWithGoogle()` → POST /api/auth/google
- [x] `getCurrentUser()` → GET /api/auth/me
- [x] `refreshUserData()` → GET /api/auth/me (force refresh)
- [x] `logoutUser()` → Supprimer token
- [x] `isAuthenticated()` → Vérifier présence token
- [x] `changePassword()` → PUT /api/auth/change-password
- [x] `getPlayerTransactionHistory()` → GET /api/players/me/transactions
- [x] `convertWinningsToGame()` → POST /api/players/me/convert
- [x] `resellerCreditPlayer()` → POST /api/resellers/:id/credit-player
- [x] `getResellerTransactionHistory()` → GET /api/resellers/me/transactions
- [x] `getAllPlayers()` → GET /api/players (admin)
- [x] `getAllResellers()` → GET /api/resellers (admin)
- [x] `suspendUser()`, `activateUser()` (admin)
- [x] `initAuth()` → Initialisation au démarrage

### 3. Refactorisation Draws (`/utils/drawsAPI.ts`)
- [x] Création de `/utils/drawsAPI.ts` avec toutes les fonctions API
- [x] `getDraws()` → GET /api/draws
- [x] `getDrawById()` → GET /api/draws/:id
- [x] `getUpcomingDraws()` → GET /api/draws/upcoming
- [x] `getPendingDraws()` → GET /api/draws/pending
- [x] `getCompletedDraws()` → GET /api/draws/completed
- [x] `createDraw()` → POST /api/draws
- [x] `updateDraw()` → PUT /api/draws/:id
- [x] `deleteDraw()` → DELETE /api/draws/:id
- [x] `publishDrawResults()` → PUT /api/draws/:id/results
- [x] `createTicket()` → POST /api/tickets
- [x] `getUserTickets()` → GET /api/tickets/me
- [x] `getBetHistory()` → GET /api/tickets/me
- [x] `getTicketById()` → GET /api/tickets/:id
- [x] `getDrawTickets()` → GET /api/tickets/draw/:id
- [x] `deleteTicket()` → DELETE /api/tickets/:id
- [x] `getUserNotifications()` → GET /api/notifications/me
- [x] `markNotificationAsRead()` → PUT /api/notifications/:id/read
- [x] `deleteNotification()` → DELETE /api/notifications/:id
- [x] `getDashboardStats()` → GET /api/admin/stats/dashboard
- [x] `getRevenueStats()` → GET /api/admin/stats/revenue
- [x] `getOperatorStats()` → GET /api/admin/stats/operators
- [x] `getCombinationStats()` → GET /api/admin/stats/combinations

### 4. Refactorisation Withdrawals (`/utils/withdrawalsAPI.ts`)
- [x] Création de `/utils/withdrawalsAPI.ts` avec toutes les fonctions API
- [x] `createWithdrawalRequest()` → POST /api/withdrawals
- [x] `getAllWithdrawalRequests()` → GET /api/withdrawals
- [x] `getUserWithdrawalRequests()` → GET /api/withdrawals/me
- [x] `approveWithdrawal()` → PUT /api/withdrawals/:id/approve
- [x] `rejectWithdrawal()` → PUT /api/withdrawals/:id/reject

---

## 🚧 ÉTAPES EN COURS

### 5. Mise à jour des Composants

**Stratégie :**
1. Remplacer les imports de `./utils/auth` par `./utils/authAPI`
2. Remplacer les imports de `./utils/draws` par `./utils/drawsAPI`
3. Remplacer les imports de `./utils/withdrawals` par `./utils/withdrawalsAPI`
4. Ajouter loading/error states partout
5. Tester chaque composant individuellement

---

## 📝 À FAIRE

### 3. Refactorisation Draws (`/utils/draws.ts`)
- [ ] `getDraws()` → GET /api/draws
- [ ] `getDrawById()` → GET /api/draws/:id
- [ ] `getUpcomingDraws()` → GET /api/draws/upcoming
- [ ] `getPendingDraws()` → GET /api/draws/pending
- [ ] `getCompletedDraws()` → GET /api/draws/completed
- [ ] `createTicket()` → POST /api/tickets
- [ ] `getUserTickets()` → GET /api/tickets/me
- [ ] `getBetHistory()` → GET /api/tickets/me (avec filtres)

### 4. Refactorisation Games (Admin)
- [ ] `createDraw()` → POST /api/draws
- [ ] `updateDraw()` → PUT /api/draws/:id
- [ ] `deleteDraw()` → DELETE /api/draws/:id
- [ ] `publishDrawResults()` → PUT /api/draws/:id/results

### 5. Refactorisation Withdrawals
- [ ] `createWithdrawalRequest()` → POST /api/withdrawals
- [ ] `getWithdrawalRequests()` → GET /api/withdrawals
- [ ] `approveWithdrawal()` → PUT /api/withdrawals/:id/approve
- [ ] `rejectWithdrawal()` → PUT /api/withdrawals/:id/reject

### 6. Refactorisation Admin Dashboard
- [ ] `getDashboardStats()` → GET /api/admin/stats/dashboard
- [ ] `getRevenueStats()` → GET /api/admin/stats/revenue
- [ ] `getOperatorStats()` → GET /api/admin/stats/operators
- [ ] `getCombinationStats()` → GET /api/admin/stats/combinations
- [ ] `getAllPlayers()` → GET /api/players
- [ ] `getAllResellers()` → GET /api/resellers
- [ ] `getAllAdmins()` → GET /api/admin/users

### 7. Mise à jour des Composants
- [ ] `LoginScreen.tsx` - Utiliser authAPI
- [ ] `RegistrationScreen.tsx` - Utiliser authAPI
- [ ] `Dashboard.tsx` - Charger draws depuis API
- [ ] `GameScreen.tsx` - Créer tickets via API
- [ ] `ProfileScreen.tsx` - Charger transactions via API
- [ ] `ResellerDashboard.tsx` - Crédit via API
- [ ] `AdminPanel.tsx` - Toutes fonctions admin via API
- [ ] `ResultsScreen.tsx` - Charger résultats via API

### 8. Gestion des États Async
- [ ] Ajouter loading states partout
- [ ] Ajouter error states partout
- [ ] Ajouter retry logic
- [ ] Ajouter offline detection
- [ ] Ajouter toast notifications pour erreurs API

### 9. Tests d'Intégration
- [ ] Tester inscription
- [ ] Tester connexion
- [ ] Tester achat ticket
- [ ] Tester recharge par revendeur
- [ ] Tester conversion gains
- [ ] Tester retrait
- [ ] Tester admin dashboard
- [ ] Tester création tirage
- [ ] Tester publication résultats

---

## 🔧 CONFIGURATION TECHNIQUE

### Environment Variables
```env
REACT_APP_API_BASE_URL=https://together-fresh-alien.ngrok-free.app
```

### Authentication Flow
```
1. User Login → POST /api/auth/login (form-urlencoded)
2. Backend retourne { access_token: "...", token_type: "bearer" }
3. Frontend stocke token dans localStorage ('loto_happy_access_token')
4. Frontend récupère user avec GET /api/auth/me (avec Bearer token)
5. Frontend stocke user dans state global (Contexte/Redux)
6. Toutes requêtes protégées incluent: Authorization: Bearer {token}
```

### API Client Usage
```typescript
import api from './utils/apiClient';

// GET
const draws = await api.get('/api/draws/upcoming');

// POST (JSON)
const ticket = await api.post('/api/tickets', { drawId, numbers, ... });

// POST (form-urlencoded)
const formData = new URLSearchParams();
formData.append('username', email);
formData.append('password', password);
const result = await api.post('/api/auth/login', formData, { useFormData: true });

// PUT
const updated = await api.put('/api/draws/123', { status: 'completed' });

// DELETE
await api.delete('/api/tickets/123');
```

### Error Handling
```typescript
try {
  const result = await api.post('/api/tickets', ticketData);
  toast.success('Pari enregistré !');
} catch (error) {
  if (error instanceof ApiError) {
    // Erreur API structurée
    toast.error(error.message);
    console.error('Code:', error.code, 'Details:', error.details);
  } else {
    // Erreur réseau ou autre
    toast.error('Erreur de connexion au serveur');
  }
}
```

---

## 📊 PROGRESSION

**Total des tâches :** ~60  
**Complétées :** 2  
**En cours :** 1  
**Restantes :** 57  

**Pourcentage :** 3%

---

## 🚨 POINTS D'ATTENTION

### Différences localStorage vs API

| Aspect | localStorage | API Backend |
|--------|-------------|-------------|
| **Auth** | User entier stocké | Token JWT + GET /me |
| **Sessions** | isLoggedIn dans user | JWT avec expiration |
| **Soldes** | Mise à jour directe | Transactions atomiques backend |
| **Gains** | Calculés frontend | Calculés backend |
| **Instantané** | Oui | Non (requêtes async) |
| **Offline** | Fonctionne | Ne fonctionne pas |

### Changements critiques

1. **Plus de `isLoggedIn`** : Remplacé par présence du token
2. **Plus de user direct dans localStorage** : Appel à GET /me à chaque besoin
3. **Format login** : `application/x-www-form-urlencoded` au lieu de JSON
4. **Field name** : Backend attend `username` (pas `email`) - accepte email OU téléphone
5. **Async partout** : Tous les appels sont maintenant async
6. **Gestion erreurs** : Doit être faite partout

---

## 📝 NOTES DE DÉVELOPPEMENT

### Session 1 - 30 Oct 2025
- Créé `.env` avec URL backend
- Créé `/utils/apiClient.ts` avec gestion complète des requêtes
  - Token JWT automatique
  - Gestion erreurs standardisée
  - Support form-urlencoded
- Commencé refactorisation auth.ts

**Prochaines étapes :**
1. Créer `/utils/authAPI.ts` avec toutes les fonctions auth via API
2. Créer `/utils/drawsAPI.ts` avec toutes les fonctions draws via API
3. Mettre à jour LoginScreen pour utiliser authAPI
4. Mettre à jour Dashboard pour utiliser drawsAPI

---

**Dernière mise à jour :** 30 Octobre 2025
