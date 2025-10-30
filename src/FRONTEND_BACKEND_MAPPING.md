# 🔗 MAPPING FRONTEND → BACKEND

Ce document montre exactement comment remplacer chaque appel localStorage par un appel API.

---

## 📋 VUE D'ENSEMBLE

**Actuellement (localStorage):**
```javascript
const users = JSON.parse(localStorage.getItem('loto_happy_users') || '[]');
```

**Futur (Backend API):**
```javascript
const response = await fetch('/api/users', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const users = await response.json();
```

---

## 🔐 AUTHENTIFICATION

### 1. Inscription

**Avant (localStorage):**
```javascript
// /utils/auth.ts - registerUser()
function registerUser(userData) {
  const users = JSON.parse(localStorage.getItem('loto_happy_users') || '[]');
  const newUser = {
    id: generateUserId(),
    ...userData,
    balanceGame: 0,
    balanceWinnings: 0,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem('loto_happy_users', JSON.stringify(users));
  localStorage.setItem('lottoHappyUser', JSON.stringify(newUser));
  return newUser;
}
```

**Après (API):**
```javascript
async function registerUser(userData) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const { user, token } = await response.json();
  
  // Stocker le token (JWT)
  localStorage.setItem('auth_token', token);
  localStorage.setItem('lottoHappyUser', JSON.stringify(user));
  
  return user;
}
```

### 2. Connexion

**Avant:**
```javascript
function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem('loto_happy_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) throw new Error('Identifiants incorrects');
  
  user.isLoggedIn = true;
  localStorage.setItem('lottoHappyUser', JSON.stringify(user));
  return user;
}
```

**Après:**
```javascript
async function loginUser(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const { user, token } = await response.json();
  
  localStorage.setItem('auth_token', token);
  localStorage.setItem('lottoHappyUser', JSON.stringify(user));
  
  return user;
}
```

### 3. Obtenir l'utilisateur actuel

**Avant:**
```javascript
function getCurrentUser() {
  const userJSON = localStorage.getItem('lottoHappyUser');
  return userJSON ? JSON.parse(userJSON) : null;
}
```

**Après:**
```javascript
async function getCurrentUser() {
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  
  const response = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('lottoHappyUser');
    return null;
  }
  
  const user = await response.json();
  localStorage.setItem('lottoHappyUser', JSON.stringify(user));
  
  return user;
}
```

---

## 🎮 TIRAGES (DRAWS)

### 1. Récupérer tous les tirages

**Avant:**
```javascript
// /utils/draws.ts
export function getDraws() {
  const drawsJSON = localStorage.getItem('loto_happy_draws');
  return drawsJSON ? JSON.parse(drawsJSON) : [];
}
```

**Après:**
```javascript
export async function getDraws() {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/draws', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Erreur récupération tirages');
  
  return await response.json();
}
```

### 2. Créer un tirage (Admin)

**Avant:**
```javascript
export function createDraw(drawData) {
  const draws = getDraws();
  const newDraw = {
    id: `draw_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...drawData,
    status: 'upcoming',
    winningNumbers: [],
    createdAt: new Date().toISOString()
  };
  draws.push(newDraw);
  localStorage.setItem('loto_happy_draws', JSON.stringify(draws));
  return newDraw;
}
```

**Après:**
```javascript
export async function createDraw(drawData) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/draws', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(drawData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}
```

### 3. Publier les résultats (Admin)

**Avant:**
```javascript
export function publishDrawResults(drawId, winningNumbers) {
  const draws = getDraws();
  const draw = draws.find(d => d.id === drawId);
  
  draw.winningNumbers = winningNumbers;
  draw.status = 'completed';
  
  localStorage.setItem('loto_happy_draws', JSON.stringify(draws));
  
  // Calculer et distribuer les gains
  distributeWinnings(drawId, winningNumbers);
  
  return draw;
}
```

**Après:**
```javascript
export async function publishDrawResults(drawId, winningNumbers) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/draws/${drawId}/results`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ winningNumbers })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  // Le backend s'occupe de calculer et distribuer les gains
  return await response.json();
}
```

---

## 🎫 TICKETS (PARIS)

### 1. Acheter un ticket

**Avant:**
```javascript
// /utils/draws.ts
export function createTicket(ticketData) {
  const tickets = getTickets();
  const users = getUsers();
  const user = users.find(u => u.id === ticketData.userId);
  
  // Vérifier le solde
  if (user.balanceGame < ticketData.betAmount) {
    throw new Error('Solde insuffisant');
  }
  
  // Déduire du solde
  user.balanceGame -= ticketData.betAmount;
  localStorage.setItem('loto_happy_users', JSON.stringify(users));
  
  // Créer le ticket
  const newTicket = {
    id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...ticketData,
    purchaseDate: new Date().toISOString(),
    status: 'pending'
  };
  
  tickets.push(newTicket);
  localStorage.setItem('loto_happy_tickets', JSON.stringify(tickets));
  
  // Créer la transaction
  addPlayerTransaction(user.id, {
    type: 'BET',
    description: `Pari sur ${getDrawOperatorName(ticketData.drawId)}`,
    amount: -ticketData.betAmount,
    balanceAfter: user.balanceGame
  });
  
  return newTicket;
}
```

**Après:**
```javascript
export async function createTicket(ticketData) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(ticketData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  
  // Mettre à jour le solde local
  const user = JSON.parse(localStorage.getItem('lottoHappyUser'));
  user.balanceGame = data.newBalance;
  localStorage.setItem('lottoHappyUser', JSON.stringify(user));
  
  return data.ticket;
}
```

### 2. Récupérer les tickets d'un joueur

**Avant:**
```javascript
export function getUserTickets(userId) {
  const tickets = getTickets();
  return tickets.filter(t => t.userId === userId);
}
```

**Après:**
```javascript
export async function getUserTickets(userId) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/tickets/user/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Erreur récupération tickets');
  
  return await response.json();
}
```

---

## 💰 TRANSACTIONS

### 1. Crédit par revendeur

**Avant:**
```javascript
// /utils/auth.ts
export function resellerCreditPlayer(resellerData) {
  const users = JSON.parse(localStorage.getItem('loto_happy_users') || '[]');
  const reseller = users.find(u => u.id === resellerData.resellerId);
  const player = users.find(u => u.phoneNumber === resellerData.playerPhoneNumber);
  
  // Vérifier solde revendeur
  if (reseller.tokenBalance < resellerData.amount) {
    throw new Error('Solde insuffisant');
  }
  
  // Déduire du revendeur
  reseller.tokenBalance -= resellerData.amount;
  
  // Créditer le joueur
  player.balanceGame += resellerData.amount;
  
  // Sauvegarder
  localStorage.setItem('loto_happy_users', JSON.stringify(users));
  
  // Ajouter aux historiques
  reseller.transactionHistory.push({
    id: `trans_${Date.now()}`,
    playerNumber: player.phoneNumber,
    playerUsername: player.username,
    amount: resellerData.amount,
    date: new Date().toISOString()
  });
  
  addPlayerTransaction(player.id, {
    type: 'RECHARGE',
    description: `Rechargé via Revendeur: ${reseller.username}`,
    amount: resellerData.amount,
    balanceAfter: player.balanceGame,
    metadata: { resellerName: reseller.username }
  });
  
  return { reseller, player };
}
```

**Après:**
```javascript
export async function resellerCreditPlayer(resellerData) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/resellers/${resellerData.resellerId}/credit-player`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      playerPhoneNumber: resellerData.playerPhoneNumber,
      amount: resellerData.amount
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  
  // Mettre à jour le solde local du revendeur
  const user = JSON.parse(localStorage.getItem('lottoHappyUser'));
  user.tokenBalance = data.resellerNewBalance;
  localStorage.setItem('lottoHappyUser', JSON.stringify(user));
  
  return data;
}
```

### 2. Conversion Gains → Jeu

**Avant:**
```javascript
export function convertWinningsToGame(userId, amount) {
  const users = JSON.parse(localStorage.getItem('loto_happy_users') || '[]');
  const user = users.find(u => u.id === userId);
  
  if (user.balanceWinnings < amount) {
    throw new Error('Solde de gains insuffisant');
  }
  
  user.balanceWinnings -= amount;
  user.balanceGame += amount;
  
  localStorage.setItem('loto_happy_users', JSON.stringify(users));
  
  addPlayerTransaction(userId, {
    type: 'CONVERSION',
    description: 'Conversion Gains → Jeu',
    amount: amount,
    balanceAfter: user.balanceGame,
    metadata: {
      fromBalance: 'winnings',
      toBalance: 'game'
    }
  });
  
  return user;
}
```

**Après:**
```javascript
export async function convertWinningsToGame(userId, amount) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/players/${userId}/convert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  
  // Mettre à jour les soldes locaux
  const user = JSON.parse(localStorage.getItem('lottoHappyUser'));
  user.balanceGame = data.newBalanceGame;
  user.balanceWinnings = data.newBalanceWinnings;
  localStorage.setItem('lottoHappyUser', JSON.stringify(user));
  
  return user;
}
```

### 3. Historique des transactions

**Avant:**
```javascript
export function getPlayerTransactionHistory(userId) {
  const users = JSON.parse(localStorage.getItem('loto_happy_users') || '[]');
  const user = users.find(u => u.id === userId);
  return user?.playerTransactionHistory || [];
}
```

**Après:**
```javascript
export async function getPlayerTransactionHistory(userId) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/players/${userId}/transactions`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Erreur récupération transactions');
  
  return await response.json();
}
```

---

## 💸 RETRAITS

### 1. Demander un retrait

**Avant:**
```javascript
// /utils/withdrawals.ts
export function createWithdrawalRequest(withdrawalData) {
  const users = JSON.parse(localStorage.getItem('loto_happy_users') || '[]');
  const user = users.find(u => u.id === withdrawalData.userId);
  
  if (user.balanceWinnings < withdrawalData.amount) {
    throw new Error('Solde de gains insuffisant');
  }
  
  // Déduire immédiatement
  user.balanceWinnings -= withdrawalData.amount;
  localStorage.setItem('loto_happy_users', JSON.stringify(users));
  
  // Créer la demande
  const withdrawals = getWithdrawalRequests();
  const newWithdrawal = {
    id: `withdraw_${Date.now()}`,
    ...withdrawalData,
    status: 'pending',
    requestDate: new Date().toISOString()
  };
  withdrawals.push(newWithdrawal);
  localStorage.setItem('loto_happy_withdrawal_requests', JSON.stringify(withdrawals));
  
  // Transaction
  addPlayerTransaction(user.id, {
    type: 'WITHDRAWAL',
    description: `Demande de retrait via ${withdrawalData.provider}`,
    amount: -withdrawalData.amount,
    balanceAfter: user.balanceWinnings,
    metadata: {
      provider: withdrawalData.provider,
      phoneNumber: withdrawalData.withdrawalPhoneNumber
    }
  });
  
  return newWithdrawal;
}
```

**Après:**
```javascript
export async function createWithdrawalRequest(withdrawalData) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/withdrawals', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(withdrawalData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  const data = await response.json();
  
  // Mettre à jour le solde local
  const user = JSON.parse(localStorage.getItem('lottoHappyUser'));
  user.balanceWinnings = data.newBalanceWinnings;
  localStorage.setItem('lottoHappyUser', JSON.stringify(user));
  
  return data.withdrawal;
}
```

### 2. Approuver/Rejeter un retrait (Admin)

**Avant:**
```javascript
export function approveWithdrawal(withdrawalId) {
  const withdrawals = getWithdrawalRequests();
  const withdrawal = withdrawals.find(w => w.id === withdrawalId);
  
  withdrawal.status = 'approved';
  withdrawal.processedDate = new Date().toISOString();
  
  localStorage.setItem('loto_happy_withdrawal_requests', JSON.stringify(withdrawals));
  
  return withdrawal;
}

export function rejectWithdrawal(withdrawalId) {
  const withdrawals = getWithdrawalRequests();
  const withdrawal = withdrawals.find(w => w.id === withdrawalId);
  
  // RE-CRÉDITER le joueur
  const users = JSON.parse(localStorage.getItem('loto_happy_users') || '[]');
  const user = users.find(u => u.id === withdrawal.userId);
  user.balanceWinnings += withdrawal.amount;
  localStorage.setItem('loto_happy_users', JSON.stringify(users));
  
  withdrawal.status = 'rejected';
  withdrawal.processedDate = new Date().toISOString();
  
  localStorage.setItem('loto_happy_withdrawal_requests', JSON.stringify(withdrawals));
  
  return withdrawal;
}
```

**Après:**
```javascript
export async function approveWithdrawal(withdrawalId) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/withdrawals/${withdrawalId}/approve`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  return await response.json();
}

export async function rejectWithdrawal(withdrawalId, reason) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/withdrawals/${withdrawalId}/reject`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }
  
  // Le backend a automatiquement re-crédité le joueur
  return await response.json();
}
```

---

## 🔔 NOTIFICATIONS

### 1. Récupérer les notifications

**Avant:**
```javascript
export function getUserNotifications(userId) {
  const notifs = JSON.parse(localStorage.getItem('loto_happy_win_notifications') || '[]');
  return notifs.filter(n => n.userId === userId).sort((a, b) => 
    new Date(b.timestamp) - new Date(a.timestamp)
  );
}
```

**Après:**
```javascript
export async function getUserNotifications(userId) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/notifications/user/${userId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Erreur récupération notifications');
  
  return await response.json();
}
```

### 2. Marquer comme lu

**Avant:**
```javascript
export function markNotificationAsRead(notificationId) {
  const notifs = JSON.parse(localStorage.getItem('loto_happy_win_notifications') || '[]');
  const notif = notifs.find(n => n.id === notificationId);
  notif.read = true;
  localStorage.setItem('loto_happy_win_notifications', JSON.stringify(notifs));
}
```

**Après:**
```javascript
export async function markNotificationAsRead(notificationId) {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Erreur mise à jour notification');
  
  return await response.json();
}
```

---

## 📊 ADMIN DASHBOARD

### 1. Stats du jour

**Avant:**
```javascript
// /utils/draws.ts
export function getDashboardStats(period = 'today') {
  const tickets = getTickets();
  const users = getUsers();
  
  // Filtrer par période
  const todayTickets = tickets.filter(t => isToday(t.purchaseDate));
  
  // Calculer les KPIs
  const totalRevenue = todayTickets.reduce((sum, t) => sum + t.betAmount, 0);
  const totalWinnings = todayTickets
    .filter(t => t.status === 'won')
    .reduce((sum, t) => sum + (t.winAmount || 0), 0);
  const totalProfit = totalRevenue - totalWinnings;
  
  const newPlayers = users.filter(u => 
    u.role === 'player' && isToday(u.createdAt)
  ).length;
  
  return {
    totalRevenue,
    totalWinnings,
    totalProfit,
    newPlayers
  };
}
```

**Après:**
```javascript
export async function getDashboardStats(period = 'today') {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/admin/stats/dashboard?period=${period}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Erreur récupération stats');
  
  return await response.json();
}
```

### 2. Revenus des 7 derniers jours

**Avant:**
```javascript
export function getLast7DaysRevenue() {
  const tickets = getTickets();
  const result = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const dayTickets = tickets.filter(t => isSameDay(t.purchaseDate, date));
    const amount = dayTickets.reduce((sum, t) => sum + t.betAmount, 0);
    
    result.push({
      day: getDayName(date),
      amount
    });
  }
  
  return result;
}
```

**Après:**
```javascript
export async function getLast7DaysRevenue() {
  const token = localStorage.getItem('auth_token');
  const response = await fetch('/api/admin/stats/revenue?days=7', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Erreur récupération revenus');
  
  return await response.json();
}
```

### 3. Combinaisons à risque

**Avant:**
```javascript
export function getCombinationStats(period = 'today') {
  const tickets = getTickets().filter(t => 
    t.status === 'pending' && isPeriod(t.purchaseDate, period)
  );
  
  const combinationMap = {};
  
  tickets.forEach(ticket => {
    const key = ticket.numbers;
    if (!combinationMap[key]) {
      combinationMap[key] = {
        combination: key,
        betCount: 0,
        totalStaked: 0,
        potentialPayout: 0
      };
    }
    combinationMap[key].betCount++;
    combinationMap[key].totalStaked += ticket.betAmount;
    combinationMap[key].potentialPayout += calculatePotentialWin(ticket);
  });
  
  return Object.values(combinationMap)
    .sort((a, b) => b.potentialPayout - a.potentialPayout);
}
```

**Après:**
```javascript
export async function getCombinationStats(period = 'today') {
  const token = localStorage.getItem('auth_token');
  const response = await fetch(`/api/admin/stats/combinations?period=${period}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Erreur récupération combinaisons');
  
  return await response.json();
}
```

---

## 🛠️ UTILITAIRES

### Helper pour les appels API avec gestion d'erreur

```javascript
// /utils/api.ts

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export class ApiError extends Error {
  constructor(public code: string, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        data.error?.code || 'UNKNOWN_ERROR',
        data.error?.message || 'Une erreur est survenue',
        data.error?.details
      );
    }
    
    return data.data || data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Erreur réseau
    throw new ApiError(
      'NETWORK_ERROR',
      'Impossible de contacter le serveur',
      { originalError: error.message }
    );
  }
}

// Exemples d'utilisation
export const api = {
  // Auth
  register: (data) => apiCall('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => apiCall('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => apiCall('/api/auth/me'),
  
  // Draws
  getDraws: () => apiCall('/api/draws'),
  getDraw: (id) => apiCall(`/api/draws/${id}`),
  createDraw: (data) => apiCall('/api/draws', { method: 'POST', body: JSON.stringify(data) }),
  
  // Tickets
  createTicket: (data) => apiCall('/api/tickets', { method: 'POST', body: JSON.stringify(data) }),
  getUserTickets: (userId) => apiCall(`/api/tickets/user/${userId}`),
  
  // Etc...
};
```

---

## 🔄 STRATÉGIE DE MIGRATION PROGRESSIVE

### Phase 1: Mode Hybride (Lecture localStorage, Écriture Backend)

```javascript
// Exemple: createTicket
export async function createTicket(ticketData) {
  try {
    // Essayer d'appeler le backend
    const ticket = await api.createTicket(ticketData);
    
    // Si succès, synchroniser avec localStorage (pour compatibilité)
    const tickets = JSON.parse(localStorage.getItem('loto_happy_tickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('loto_happy_tickets', JSON.stringify(tickets));
    
    return ticket;
  } catch (error) {
    console.warn('Backend unavailable, using localStorage', error);
    
    // Fallback sur localStorage (ancien système)
    return createTicketLocalStorage(ticketData);
  }
}
```

### Phase 2: Mode Backend-First (Backend prioritaire)

```javascript
export async function createTicket(ticketData) {
  try {
    // Backend d'abord
    return await api.createTicket(ticketData);
  } catch (error) {
    // Fallback localStorage uniquement si erreur réseau
    if (error.code === 'NETWORK_ERROR') {
      console.warn('Backend unavailable, using localStorage');
      return createTicketLocalStorage(ticketData);
    }
    throw error;
  }
}
```

### Phase 3: Mode Backend-Only (Production)

```javascript
export async function createTicket(ticketData) {
  // Plus de localStorage, uniquement backend
  return await api.createTicket(ticketData);
}
```

---

## 📋 CHECKLIST DE MIGRATION

Pour chaque fonction utilisant localStorage:

- [ ] Identifier la fonction dans `/utils/auth.ts` ou `/utils/draws.ts`
- [ ] Trouver l'endpoint API correspondant dans `API_EXAMPLES.md`
- [ ] Remplacer `localStorage.getItem()` par `fetch()`
- [ ] Ajouter gestion d'erreur
- [ ] Mettre à jour le state local si nécessaire
- [ ] Tester avec le backend
- [ ] Supprimer l'ancien code localStorage

---

## 🎯 RÉSUMÉ DES CHANGEMENTS MAJEURS

| Aspect | Avant (localStorage) | Après (Backend API) |
|--------|---------------------|---------------------|
| **Auth** | Stockage du user entier | Stockage du token JWT |
| **Sessions** | `isLoggedIn: true` dans user | JWT avec expiration |
| **Mots de passe** | Comparaison directe | Hashé avec bcrypt |
| **Soldes** | Mise à jour directe | Transactions atomiques |
| **Gains** | Calcul côté frontend | Calcul côté backend |
| **Notifications** | Création manuelle | Auto-générées par backend |
| **Permissions** | Vérif côté frontend | Middleware backend |
| **Données** | Stockage navigateur | Base de données |

---

**Fin du mapping Frontend → Backend**

Pour l'implémentation complète de chaque endpoint, voir `API_EXAMPLES.md`.
