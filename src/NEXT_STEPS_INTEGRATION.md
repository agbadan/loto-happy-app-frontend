# 🎯 PROCHAINES ÉTAPES - Intégration Backend

**Statut :** 🟡 70% Backend API créé, 0% Frontend intégré  
**Date :** 30 Octobre 2025

---

## ✅ CE QUI EST FAIT

### Backend API (100%)
- ✅ Client HTTP centralisé (`/utils/apiClient.ts`)
- ✅ Toutes les fonctions Auth (`/utils/authAPI.ts`)
- ✅ Toutes les fonctions Draws & Tickets (`/utils/drawsAPI.ts`)
- ✅ Toutes les fonctions Withdrawals (`/utils/withdrawalsAPI.ts`)

**Total : ~500 lignes de code d'intégration API**

---

## 🚧 CE QU'IL RESTE À FAIRE

### 1. Mettre à jour App.tsx (PRIORITÉ 1) ⭐⭐⭐

**Fichier:** `/App.tsx`

**Changements requis :**
```typescript
// AVANT
import { getCurrentUser, logoutUser } from './utils/auth';

// APRÈS
import { 
  getCurrentUser, 
  logoutUser, 
  isAuthenticated,
  initAuth 
} from './utils/authAPI';

// Ajouter au useEffect initial:
useEffect(() => {
  const init = async () => {
    try {
      const user = await initAuth();
      if (user) {
        setCurrentUser(user);
        // Rediriger selon le rôle
      }
    } catch (error) {
      console.error('Init error:', error);
    }
  };
  init();
}, []);
```

### 2. Mettre à jour PasswordLoginScreen.tsx (PRIORITÉ 1) ⭐⭐⭐

**Fichier:** `/components/PasswordLoginScreen.tsx`

**Changements requis :**
```typescript
// AVANT
import { loginUser, isAdminCredentials, loginAsAdmin } from '../utils/auth';

// APRÈS
import { loginUser } from '../utils/authAPI';

// Dans handleLogin():
const handleLogin = async () => {
  if (!password || password.length < 6) {
    toast.error('Veuillez entrer un mot de passe valide');
    return;
  }
  
  setLoading(true); // Ajouter état loading
  
  try {
    // loginUser attend emailOrPhone, pas phoneNumber séparé
    const user = await loginUser({
      emailOrPhone: phoneNumber, // Peut être email ou téléphone
      password: password,
    });
    
    toast.success(`Bienvenue ${user.username} ! 🎉`);
    
    // Rediriger selon le rôle
    if (user.role === 'admin') {
      onLoginAsAdmin();
    } else if (user.role === 'reseller') {
      onLoginAsReseller();
    } else {
      onLogin();
    }
    
  } catch (error) {
    toast.error(error.message || 'Erreur de connexion');
  } finally {
    setLoading(false);
  }
};
```

**Ajouter loading state:**
```typescript
const [loading, setLoading] = useState(false);

// Dans le bouton:
<Button 
  onClick={handleLogin} 
  disabled={loading}
>
  {loading ? 'Connexion...' : 'Se connecter'}
</Button>
```

### 3. Mettre à jour RegistrationScreen.tsx (PRIORITÉ 1) ⭐⭐⭐

**Fichier:** `/components/RegistrationScreen.tsx`

**Changements requis :**
```typescript
// AVANT
import { registerUser } from '../utils/auth';

// APRÈS
import { registerUser } from '../utils/authAPI';

// Dans handleRegister():
const handleRegister = async () => {
  // ... validation ...
  
  setLoading(true);
  
  try {
    const user = await registerUser({
      username: formData.username,
      email: formData.email,
      phoneNumber: `${formData.countryCode}${formData.phoneNumber}`,
      password: formData.password,
      role: 'player', // Toujours joueur à l'inscription
    });
    
    toast.success(`Compte créé avec succès ! Bienvenue ${user.username} ! 🎉`);
    onRegister(); // Rediriger vers dashboard
    
  } catch (error) {
    toast.error(error.message || 'Erreur lors de l\'inscription');
  } finally {
    setLoading(false);
  }
};
```

### 4. Mettre à jour Dashboard.tsx (PRIORITÉ 2) ⭐⭐

**Fichier:** `/components/Dashboard.tsx`

**Changements requis :**
```typescript
// AVANT
import { getDraws, updateDrawStatuses } from '../utils/draws';

// APRÈS
import { getUpcomingDraws } from '../utils/drawsAPI';

// Dans useEffect:
useEffect(() => {
  const fetchDraws = async () => {
    setLoading(true);
    try {
      const draws = await getUpcomingDraws();
      setAvailableDraws(draws);
      setFeaturedDraw(draws[0] || null);
    } catch (error) {
      toast.error('Erreur lors du chargement des tirages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchDraws();
}, []);
```

**Ajouter états loading/error:**
```typescript
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Afficher loading spinner si loading
if (loading) return <div>Chargement...</div>;
```

### 5. Mettre à jour GameScreen.tsx (PRIORITÉ 2) ⭐⭐

**Fichier:** `/components/GameScreen.tsx`

**Changements requis :**
```typescript
// AVANT
import { createTicket } from '../utils/draws';

// APRÈS
import { createTicket } from '../utils/drawsAPI';
import { refreshUserData } from '../utils/authAPI';

// Dans handleBuyTicket():
const handleBuyTicket = async () => {
  // ... validation ...
  
  setSubmitting(true);
  
  try {
    const result = await createTicket({
      drawId: draw.id,
      betType: 'NAP2', // Ou le type choisi
      numbers: selectedNumbers.join(', '),
      betAmount: betAmount,
    });
    
    toast.success(`Pari enregistré ! Nouveau solde : ${result.newBalance} F`);
    
    // Le solde est déjà rafraîchi par createTicket, mais on peut forcer:
    await refreshUserData();
    
    // Rediriger
    onNavigateToProfile();
    
  } catch (error) {
    toast.error(error.message || 'Erreur lors de l\'achat du ticket');
  } finally {
    setSubmitting(false);
  }
};
```

### 6. Mettre à jour ProfileScreen.tsx (PRIORITÉ 2) ⭐⭐

**Fichier:** `/components/ProfileScreen.tsx`

**Changements requis :**
```typescript
// AVANT
import { 
  getCurrentUser, 
  logoutUser, 
  changePassword, 
  getPlayerTransactionHistory, 
  withdrawMoney 
} from "../utils/auth";

// APRÈS
import { 
  getCurrentUser, 
  logoutUser, 
  changePassword, 
  getPlayerTransactionHistory,
  refreshUserData 
} from '../utils/authAPI';
import { createWithdrawalRequest } from '../utils/withdrawalsAPI';

// Charger les transactions:
useEffect(() => {
  const fetchTransactions = async () => {
    try {
      const transactions = await getPlayerTransactionHistory();
      setTransactions(transactions);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
    }
  };
  
  if (currentUser) {
    fetchTransactions();
  }
}, [currentUser]);

// Pour le retrait:
const handleWithdraw = async (amount: number, provider: string, phone: string) => {
  try {
    const result = await createWithdrawalRequest({
      amount,
      provider,
      withdrawalPhoneNumber: phone,
    });
    
    toast.success('Demande de retrait envoyée !');
    // Rafraîchir les données
    await refreshUserData();
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 7. Mettre à jour ResellerDashboard.tsx (PRIORITÉ 3) ⭐

**Fichier:** `/components/ResellerDashboard.tsx`

**Changements requis :**
```typescript
// AVANT
import { resellerCreditPlayer } from '../utils/auth';

// APRÈS
import { resellerCreditPlayer } from '../utils/authAPI';

// Dans handleCredit:
const handleCredit = async () => {
  // ... validation ...
  
  try {
    const result = await resellerCreditPlayer(
      currentUser.id,
      playerPhone,
      amount
    );
    
    toast.success(`Compte crédité ! Votre nouveau solde : ${result.resellerNewBalance} F`);
    
    // Reset form
  } catch (error) {
    toast.error(error.message);
  }
};
```

### 8. Mettre à jour AdminPanel.tsx (PRIORITÉ 3) ⭐

**Fichier:** `/components/AdminPanel.tsx`

**Changements requis :**
```typescript
// AVANT
import { /* ... */ } from '../utils/auth';
import { /* ... */ } from '../utils/draws';

// APRÈS
import { getAllPlayers, getAllResellers } from '../utils/authAPI';
import { 
  getDashboardStats, 
  getRevenueStats,
  getOperatorStats,
  getUpcomingDraws,
  getPendingDraws,
  getCompletedDraws
} from '../utils/drawsAPI';
import { getAllWithdrawalRequests, approveWithdrawal, rejectWithdrawal } from '../utils/withdrawalsAPI';

// Charger les stats:
useEffect(() => {
  const fetchStats = async () => {
    try {
      const stats = await getDashboardStats();
      const revenue = await getRevenueStats(7);
      const operators = await getOperatorStats();
      
      setDashboardStats(stats);
      setRevenueData(revenue);
      setOperatorData(operators);
    } catch (error) {
      console.error('Erreur stats:', error);
    }
  };
  
  fetchStats();
  
  // Refresh toutes les 10 secondes
  const interval = setInterval(fetchStats, 10000);
  return () => clearInterval(interval);
}, []);
```

---

## 📊 ORDRE DE PRIORITÉ

### Phase 1: Auth (1-2 heures)
1. App.tsx - Initialisation
2. PasswordLoginScreen.tsx - Connexion
3. RegistrationScreen.tsx - Inscription
4. Tester: Inscription + Connexion + Session

### Phase 2: Gameplay (2-3 heures)
5. Dashboard.tsx - Affichage tirages
6. GameScreen.tsx - Achat tickets
7. ProfileScreen.tsx - Historique & Retraits
8. Tester: Flow complet joueur

### Phase 3: Revendeurs & Admin (2-3 heures)
9. ResellerDashboard.tsx - Crédit joueurs
10. AdminPanel.tsx - Toutes fonctions admin
11. Tester: Flow complet revendeur + admin

---

## 🧪 TESTS À FAIRE

### Test 1: Inscription & Connexion
- [ ] Créer un compte joueur
- [ ] Se déconnecter
- [ ] Se reconnecter
- [ ] Vérifier que le token est bien stocké
- [ ] Vérifier que GET /me fonctionne

### Test 2: Achat de Ticket
- [ ] Voir les tirages disponibles
- [ ] Acheter un ticket NAP2
- [ ] Vérifier que le solde est déduit
- [ ] Voir le ticket dans l'historique

### Test 3: Conversion Gains → Jeu
- [ ] Avoir des gains dans balanceWinnings
- [ ] Convertir une partie en balanceGame
- [ ] Vérifier les soldes

### Test 4: Demande de Retrait
- [ ] Demander un retrait
- [ ] Vérifier que balanceWinnings est déduit
- [ ] Voir la demande en statut pending

### Test 5: Revendeur
- [ ] Se connecter en tant que revendeur
- [ ] Créditer un joueur
- [ ] Vérifier que tokenBalance est déduit
- [ ] Vérifier que le joueur a bien reçu

### Test 6: Admin
- [ ] Se connecter en tant qu'admin
- [ ] Créer un tirage
- [ ] Voir les stats dashboard
- [ ] Approuver/rejeter un retrait

---

## 🚨 POINTS D'ATTENTION

### Gestion des erreurs
- Toutes les fonctions API peuvent throw
- TOUJOURS utiliser try/catch
- Afficher les erreurs à l'utilisateur

### Loading states
- Toutes les opérations sont async
- Afficher un loading pendant les requêtes
- Désactiver les boutons pendant loading

### Refresh des données
- Après achat ticket → refreshUserData()
- Après crédit → refreshUserData()
- Après conversion → refreshUserData()
- Après retrait → refreshUserData()

### Token JWT
- Stocké dans localStorage ('loto_happy_access_token')
- Ajouté automatiquement par apiClient
- Si expiré, user est déconnecté automatiquement

---

## 💡 COMMANDES RAPIDES

### Chercher tous les imports auth
```bash
grep -r "from.*utils/auth" components/
```

### Chercher tous les imports draws
```bash
grep -r "from.*utils/draws" components/
```

### Chercher tous les localStorage.getItem
```bash
grep -r "localStorage.getItem" components/
```

---

## ✅ CHECKLIST FINALE

Avant de dire "c'est terminé":
- [ ] Aucun import de `./utils/auth` (sauf constantes)
- [ ] Aucun import de `./utils/draws` (sauf constantes)
- [ ] Aucun `localStorage.setItem('loto_happy_*')`
- [ ] Tous les appels API ont try/catch
- [ ] Tous les boutons ont loading state
- [ ] Tests manuels passent
- [ ] Aucune erreur console
- [ ] Token JWT fonctionne
- [ ] Déconnexion fonctionne
- [ ] Reconnexion fonctionne

---

**Prochaine étape immédiate :** Modifier App.tsx pour utiliser initAuth()
