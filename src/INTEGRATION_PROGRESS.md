# 🔄 PROGRESSION INTÉGRATION BACKEND

**Date:** 30 Octobre 2025  
**Statut:** 🟡 EN COURS (40% complété)

---

## ✅ FAIT

### 1. Infrastructure API (100%)
- [x] `.env` configuré
- [x] `/utils/apiClient.ts` créé et fonctionnel
- [x] `/utils/authAPI.ts` créé avec toutes les fonctions auth
- [x] `/utils/drawsAPI.ts` créé avec toutes les fonctions draws/tickets
- [x] `/utils/withdrawalsAPI.ts` créé avec toutes les fonctions retraits

### 2. Composants Modifiés (40%)
- [x] **App.tsx** (80% fait)
  - ✅ Import authAPI
  - ✅ `initAuth()` au démarrage
  - ✅ État `currentUser` avec type User
  - ✅ Refresh balances via API
  - ⏳ Quelques fonctions utilisent encore l'ancien auth

- [x] **PasswordLoginScreen.tsx** (100% fait)
  - ✅ Import authAPI au lieu de auth
  - ✅ `loginUser()` via API
  - ✅ Loading state ajouté
  - ✅ Gestion erreurs ApiError
  - ✅ Bouton avec spinner pendant loading

- [x] **RegistrationScreen.tsx** (50% fait)
  - ✅ Import authAPI
  - ✅ `registerUser()` via API pour inscription normale
  - ✅ Loading state
  - ✅ Gestion erreurs
  - ⏳ `handleGoogleSignup()` pas encore migré (conflit de fichier)

---

## ⏳ À FAIRE

### 3. Composants Restants (60%)

#### Priorité 1 - Gameplay Core
- [ ] **Dashboard.tsx**
  - Remplacer `getDraws()` par `getUpcomingDraws()`
  - Ajouter loading state
  - Gérer erreurs réseau

- [ ] **GameScreen.tsx**
  - Remplacer `createTicket()` par version API
  - Ajouter loading pendant achat
  - Rafraîchir soldes après achat
  - Gérer erreurs (solde insuffisant, etc.)

- [ ] **ProfileScreen.tsx**
  - Charger transactions via `getPlayerTransactionHistory()`
  - Créer retraits via `createWithdrawalRequest()`
  - Conversion via `convertWinningsToGame()`
  - Loading states partout

#### Priorité 2 - Revendeurs & Admin
- [ ] **ResellerDashboard.tsx**
  - Crédit via `resellerCreditPlayer()`
  - Historique via `getResellerTransactionHistory()`

- [ ] **AdminPanel.tsx** & sous-composants
  - Stats via `getDashboardStats()`, `getRevenueStats()`
  - Tirages via `createDraw()`, `publishDrawResults()`
  - Retraits via `approveWithdrawal()`, `rejectWithdrawal()`
  - Utilisateurs via `getAllPlayers()`, `getAllResellers()`

#### Priorité 3 - Autres
- [ ] **ResultsScreen.tsx**
  - Charger résultats via `getCompletedDraws()`

- [ ] **BetHistory.tsx**
  - Charger via `getBetHistory()`

---

## 🐛 PROBLÈMES RENCONTRÉS

### 1. Conflit edit_tool
**Problème:** L'outil edit_tool échoue parfois à trouver le texte exact  
**Solution:** Utiliser write_tool pour réécrire le fichier complet si nécessaire

### 2. RegistrationScreen.tsx - handleGoogleSignup
**Statut:** ⏳ Pas encore migré  
**Raison:** Conflit lors de l'edit  
**Action requise:** Réécrire la fonction manuellement ou utiliser write_tool

---

## 📋 PLAN POUR LA SUITE

### Étape 1: Finir RegistrationScreen.tsx
Corriger `handleGoogleSignup()` pour utiliser `loginWithGoogle()` de authAPI

### Étape 2: Dashboard.tsx
```typescript
// AVANT
import { getDraws } from '../utils/draws';
const draws = getDraws();

// APRÈS
import { getUpcomingDraws } from '../utils/drawsAPI';
const [draws, setDraws] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchDraws = async () => {
    try {
      const data = await getUpcomingDraws();
      setDraws(data);
    } catch (error) {
      toast.error('Erreur chargement tirages');
    } finally {
      setLoading(false);
    }
  };
  fetchDraws();
}, []);
```

### Étape 3: GameScreen.tsx
```typescript
// AVANT
import { createTicket } from '../utils/draws';
createTicket(ticketData);

// APRÈS
import { createTicket } from '../utils/drawsAPI';
const [submitting, setSubmitting] = useState(false);

const handleBuy = async () => {
  setSubmitting(true);
  try {
    const result = await createTicket(ticketData);
    toast.success(`Pari créé ! Solde: ${result.newBalance} F`);
  } catch (error) {
    toast.error(error.message);
  } finally {
    setSubmitting(false);
  }
};
```

### Étape 4: ProfileScreen.tsx
```typescript
// AVANT
import { getPlayerTransactionHistory } from '../utils/auth';
const transactions = getPlayerTransactionHistory(userId);

// APRÈS
import { getPlayerTransactionHistory } from '../utils/authAPI';
const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetch = async () => {
    try {
      const data = await getPlayerTransactionHistory();
      setTransactions(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  fetch();
}, []);
```

### Étape 5: ResellerDashboard.tsx
```typescript
// AVANT
import { resellerCreditPlayer } from '../utils/auth';
resellerCreditPlayer(data);

// APRÈS
import { resellerCreditPlayer } from '../utils/authAPI';

const handleCredit = async () => {
  setLoading(true);
  try {
    const result = await resellerCreditPlayer(resellerId, playerPhone, amount);
    toast.success(`Crédité ! Nouveau solde: ${result.resellerNewBalance} F`);
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
```

### Étape 6: AdminPanel.tsx
```typescript
// AVANT
import { getDashboardStats } from '../utils/draws';
const stats = getDashboardStats();

// APRÈS
import { getDashboardStats } from '../utils/drawsAPI';
const [stats, setStats] = useState(null);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };
  
  fetchStats();
  const interval = setInterval(fetchStats, 10000); // Refresh toutes les 10s
  return () => clearInterval(interval);
}, []);
```

---

## 🧪 TESTS À EFFECTUER

Après chaque modification :
1. Vérifier que l'app compile sans erreur
2. Tester le flow modifié manuellement
3. Vérifier dans Network (F12) que les requêtes API sont bien envoyées
4. Vérifier que le token JWT est bien inclus dans les headers
5. Vérifier les erreurs en cas d'échec

---

## 💡 NOTES TECHNIQUES

### Pattern à suivre pour TOUS les composants:

```typescript
// 1. Import API
import { functionName } from '../utils/authAPI'; // ou drawsAPI, withdrawalsAPI

// 2. États
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// 3. Fonction async
const handleAction = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await functionName(params);
    setData(result);
    toast.success('Succès !');
  } catch (error) {
    setError(error.message);
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};

// 4. UI avec loading/error
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;
return <YourComponent data={data} />;
```

---

**Prochaine action:** Modifier Dashboard.tsx pour charger les tirages via API
