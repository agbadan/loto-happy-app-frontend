# 📡 EXEMPLES D'API - LOTO HAPPY

Ce document contient des exemples concrets de requêtes et réponses pour chaque endpoint de l'API.

---

## 🔐 AUTHENTICATION

### 1. Inscription d'un joueur

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "JohnDoe",
  "email": "john@example.com",
  "phoneNumber": "+22890123456",
  "password": "SecurePass123!",
  "authMethod": "password",
  "role": "player"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "user": {
      "id": "user_1730217600000_abc123",
      "username": "JohnDoe",
      "email": "john@example.com",
      "phoneNumber": "+22890123456",
      "role": "player",
      "status": "active",
      "balanceGame": 0,
      "balanceWinnings": 0,
      "createdAt": "2025-10-29T14:30:00.000Z",
      "lastLogin": "2025-10-29T14:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Connexion

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": "user_1730217600000_abc123",
      "username": "JohnDoe",
      "email": "john@example.com",
      "phoneNumber": "+22890123456",
      "role": "player",
      "status": "active",
      "balanceGame": 5000,
      "balanceWinnings": 12500,
      "lastLogin": "2025-10-29T15:45:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Connexion Google OAuth

**Request:**
```http
POST /api/auth/google
Content-Type: application/json

{
  "googleToken": "ya29.a0AfH6SMB...",
  "phoneNumber": "+22890123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Connexion Google réussie",
  "data": {
    "user": {
      "id": "user_1730217600000_xyz789",
      "username": "John Doe",
      "email": "john.google@gmail.com",
      "phoneNumber": "+22890123456",
      "authMethod": "google",
      "role": "player",
      "status": "active",
      "balanceGame": 0,
      "balanceWinnings": 0,
      "createdAt": "2025-10-29T15:00:00.000Z",
      "lastLogin": "2025-10-29T15:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "isNewUser": true
  }
}
```

---

## 🎮 DRAWS (Tirages)

### 1. Créer un tirage (Admin)

**Request:**
```http
POST /api/draws
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "operatorId": "togo-kadoo",
  "date": "2025-10-30",
  "time": "18:00",
  "multipliers": {
    "NAP1": 10,
    "NAP2": 500,
    "NAP3": 5000,
    "NAP4": 25000,
    "NAP5": 100000,
    "PERMUTATION": 250,
    "BANKA": 150,
    "CHANCE_PLUS": 2000,
    "ANAGRAMME": 10
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Tirage créé avec succès",
  "data": {
    "id": "draw_1730217600000_def456",
    "operatorId": "togo-kadoo",
    "date": "2025-10-30",
    "time": "18:00",
    "status": "upcoming",
    "multipliers": {
      "NAP1": 10,
      "NAP2": 500,
      "NAP3": 5000,
      "NAP4": 25000,
      "NAP5": 100000,
      "PERMUTATION": 250,
      "BANKA": 150,
      "CHANCE_PLUS": 2000,
      "ANAGRAMME": 10
    },
    "winningNumbers": [],
    "createdAt": "2025-10-29T15:30:00.000Z",
    "createdBy": "admin_1730000000000_admin1"
  }
}
```

### 2. Publier les résultats (Admin)

**Request:**
```http
PUT /api/draws/draw_1730217600000_def456/results
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "winningNumbers": [12, 34, 56, 78, 90]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Résultats publiés avec succès",
  "data": {
    "draw": {
      "id": "draw_1730217600000_def456",
      "operatorId": "togo-kadoo",
      "date": "2025-10-30",
      "time": "18:00",
      "status": "completed",
      "winningNumbers": [12, 34, 56, 78, 90],
      "updatedAt": "2025-10-30T18:15:00.000Z"
    },
    "stats": {
      "totalTickets": 1547,
      "totalWinners": 89,
      "totalWinnings": 2450000,
      "totalRevenue": 3850000,
      "profit": 1400000
    }
  }
}
```

### 3. Liste des tirages à venir

**Request:**
```http
GET /api/draws/upcoming
Authorization: Bearer {user_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "draw_1730217600000_def456",
      "operatorId": "togo-kadoo",
      "operatorName": "Lotto Kadoo",
      "operatorIcon": "🎯",
      "operatorColor": "#FFD700",
      "date": "2025-10-30",
      "time": "18:00",
      "status": "upcoming",
      "multipliers": {
        "NAP1": 10,
        "NAP2": 500,
        "NAP3": 5000,
        "NAP4": 25000,
        "NAP5": 100000
      },
      "participants": 247
    },
    {
      "id": "draw_1730304000000_ghi789",
      "operatorId": "benin-lotto",
      "operatorName": "Bénin Lotto",
      "operatorIcon": "🇧🇯",
      "operatorColor": "#FF6B00",
      "date": "2025-10-31",
      "time": "20:00",
      "status": "upcoming",
      "multipliers": {
        "NAP1": 10,
        "NAP2": 500,
        "NAP3": 5000
      },
      "participants": 0
    }
  ]
}
```

---

## 🎫 TICKETS (Paris)

### 1. Acheter un ticket NAP2

**Request:**
```http
POST /api/tickets
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "drawId": "draw_1730217600000_def456",
  "betType": "NAP2",
  "numbers": "12, 34",
  "betAmount": 1000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Pari enregistré avec succès",
  "data": {
    "ticket": {
      "id": "ticket_1730220000000_abc123",
      "userId": "user_1730217600000_abc123",
      "username": "JohnDoe",
      "drawId": "draw_1730217600000_def456",
      "betType": "NAP2",
      "numbers": "12, 34",
      "betAmount": 1000,
      "purchaseDate": "2025-10-29T16:00:00.000Z",
      "status": "pending"
    },
    "newBalance": 4000
  }
}
```

### 2. Acheter un ticket PERMUTATION

**Request:**
```http
POST /api/tickets
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "drawId": "draw_1730217600000_def456",
  "betType": "PERMUTATION",
  "numbers": "12, 34, 56, 78",
  "betAmount": 3000,
  "combinations": [
    [12, 34],
    [12, 56],
    [12, 78],
    [34, 56],
    [34, 78],
    [56, 78]
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Pari PERMUTATION enregistré avec succès",
  "data": {
    "ticket": {
      "id": "ticket_1730220600000_perm123",
      "userId": "user_1730217600000_abc123",
      "username": "JohnDoe",
      "drawId": "draw_1730217600000_def456",
      "betType": "PERMUTATION",
      "numbers": "12, 34, 56, 78",
      "betAmount": 3000,
      "combinations": [
        [12, 34],
        [12, 56],
        [12, 78],
        [34, 56],
        [34, 78],
        [56, 78]
      ],
      "purchaseDate": "2025-10-29T16:10:00.000Z",
      "status": "pending"
    },
    "combinationsCount": 6,
    "betPerCombination": 500,
    "newBalance": 1000
  }
}
```

### 3. Acheter un ticket BANKA

**Request:**
```http
POST /api/tickets
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "drawId": "draw_1730217600000_def456",
  "betType": "BANKA",
  "numbers": "12, 34, 56, 78",
  "baseNumber": 12,
  "associatedNumbers": [34, 56, 78],
  "betAmount": 1500
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Pari BANKA enregistré avec succès",
  "data": {
    "ticket": {
      "id": "ticket_1730221200000_banka123",
      "userId": "user_1730217600000_abc123",
      "username": "JohnDoe",
      "drawId": "draw_1730217600000_def456",
      "betType": "BANKA",
      "numbers": "12, 34, 56, 78",
      "baseNumber": 12,
      "associatedNumbers": [34, 56, 78],
      "betAmount": 1500,
      "purchaseDate": "2025-10-29T16:20:00.000Z",
      "status": "pending"
    },
    "newBalance": 2500
  }
}
```

### 4. Historique des paris d'un joueur

**Request:**
```http
GET /api/tickets/user/user_1730217600000_abc123
Authorization: Bearer {user_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ticket_1730220000000_abc123",
      "drawId": "draw_1730217600000_def456",
      "operatorName": "Lotto Kadoo",
      "betType": "NAP2",
      "numbers": "12, 34",
      "betAmount": 1000,
      "purchaseDate": "2025-10-29T16:00:00.000Z",
      "drawDate": "2025-10-30",
      "drawTime": "18:00",
      "status": "won",
      "winAmount": 500000,
      "winningNumbers": [12, 34, 56, 78, 90]
    },
    {
      "id": "ticket_1730135000000_xyz456",
      "drawId": "draw_1730000000000_old123",
      "operatorName": "Bénin Lotto",
      "betType": "NAP3",
      "numbers": "5, 15, 25",
      "betAmount": 500,
      "purchaseDate": "2025-10-28T14:30:00.000Z",
      "drawDate": "2025-10-29",
      "drawTime": "20:00",
      "status": "lost",
      "winAmount": 0,
      "winningNumbers": [10, 20, 30, 40, 50]
    }
  ]
}
```

---

## 💰 TRANSACTIONS

### 1. Recharge par revendeur

**Request:**
```http
POST /api/resellers/reseller_12345/credit-player
Authorization: Bearer {reseller_token}
Content-Type: application/json

{
  "playerPhoneNumber": "+22890123456",
  "amount": 5000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Compte crédité avec succès",
  "data": {
    "transaction": {
      "id": "trans_1730225000000_credit1",
      "resellerId": "reseller_12345",
      "playerId": "user_1730217600000_abc123",
      "playerNumber": "+22890123456",
      "playerUsername": "JohnDoe",
      "amount": 5000,
      "date": "2025-10-29T17:00:00.000Z"
    },
    "resellerNewBalance": 95000,
    "playerNewBalance": 9000
  }
}
```

### 2. Conversion Gains → Jeu

**Request:**
```http
POST /api/players/user_1730217600000_abc123/convert
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "amount": 10000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Conversion effectuée avec succès",
  "data": {
    "transaction": {
      "id": "trans_1730225600000_conv1",
      "userId": "user_1730217600000_abc123",
      "type": "CONVERSION",
      "description": "Conversion Gains → Jeu",
      "amount": 10000,
      "date": "2025-10-29T17:10:00.000Z",
      "metadata": {
        "fromBalance": "winnings",
        "toBalance": "game"
      }
    },
    "newBalanceGame": 19000,
    "newBalanceWinnings": 2500
  }
}
```

### 3. Historique transactions joueur

**Request:**
```http
GET /api/players/user_1730217600000_abc123/transactions
Authorization: Bearer {user_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "trans_1730225600000_conv1",
      "type": "CONVERSION",
      "description": "Conversion Gains → Jeu",
      "amount": 10000,
      "balanceAfter": 19000,
      "date": "2025-10-29T17:10:00.000Z",
      "metadata": {
        "fromBalance": "winnings",
        "toBalance": "game"
      }
    },
    {
      "id": "trans_1730225000000_credit1",
      "type": "RECHARGE",
      "description": "Rechargé via Revendeur: Marie Kokou",
      "amount": 5000,
      "balanceAfter": 9000,
      "date": "2025-10-29T17:00:00.000Z",
      "metadata": {
        "resellerName": "Marie Kokou"
      }
    },
    {
      "id": "trans_1730220000000_bet1",
      "type": "BET",
      "description": "Pari NAP2 sur Lotto Kadoo",
      "amount": -1000,
      "balanceAfter": 4000,
      "date": "2025-10-29T16:00:00.000Z",
      "metadata": {
        "gameName": "Lotto Kadoo"
      }
    },
    {
      "id": "trans_1730304000000_win1",
      "type": "WIN",
      "description": "Gain NAP2 - Lotto Kadoo",
      "amount": 500000,
      "balanceAfter": 512500,
      "date": "2025-10-30T18:15:00.000Z",
      "metadata": {
        "gameName": "Lotto Kadoo"
      }
    }
  ]
}
```

---

## 💸 WITHDRAWALS (Retraits)

### 1. Demander un retrait

**Request:**
```http
POST /api/withdrawals
Authorization: Bearer {user_token}
Content-Type: application/json

{
  "amount": 50000,
  "provider": "TMoney",
  "withdrawalPhoneNumber": "+22890123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Demande de retrait enregistrée",
  "data": {
    "withdrawal": {
      "id": "withdraw_1730226000000_wd1",
      "userId": "user_1730217600000_abc123",
      "username": "JohnDoe",
      "phoneNumber": "+22890123456",
      "amount": 50000,
      "provider": "TMoney",
      "withdrawalPhoneNumber": "+22890123456",
      "status": "pending",
      "requestDate": "2025-10-29T17:20:00.000Z"
    },
    "newBalanceWinnings": 462500
  }
}
```

### 2. Approuver un retrait (Admin)

**Request:**
```http
PUT /api/withdrawals/withdraw_1730226000000_wd1/approve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "notes": "Transfert effectué via TMoney"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Retrait approuvé avec succès",
  "data": {
    "withdrawal": {
      "id": "withdraw_1730226000000_wd1",
      "userId": "user_1730217600000_abc123",
      "username": "JohnDoe",
      "amount": 50000,
      "provider": "TMoney",
      "withdrawalPhoneNumber": "+22890123456",
      "status": "approved",
      "requestDate": "2025-10-29T17:20:00.000Z",
      "processedDate": "2025-10-29T17:45:00.000Z",
      "processedBy": "admin_1730000000000_admin1"
    }
  }
}
```

### 3. Rejeter un retrait (Admin)

**Request:**
```http
PUT /api/withdrawals/withdraw_1730226000000_wd2/reject
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "reason": "Numéro de téléphone invalide"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Retrait rejeté",
  "data": {
    "withdrawal": {
      "id": "withdraw_1730226000000_wd2",
      "userId": "user_1730217600000_abc123",
      "username": "JohnDoe",
      "amount": 25000,
      "provider": "Flooz",
      "withdrawalPhoneNumber": "+22812345",
      "status": "rejected",
      "requestDate": "2025-10-29T17:25:00.000Z",
      "processedDate": "2025-10-29T17:50:00.000Z",
      "processedBy": "admin_1730000000000_admin1",
      "rejectionReason": "Numéro de téléphone invalide"
    },
    "playerRefundedAmount": 25000,
    "playerNewBalance": 487500
  }
}
```

---

## 🔔 NOTIFICATIONS

### 1. Liste des notifications d'un joueur

**Request:**
```http
GET /api/notifications/user/user_1730217600000_abc123
Authorization: Bearer {user_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_1730304000000_n1",
      "userId": "user_1730217600000_abc123",
      "drawId": "draw_1730217600000_def456",
      "operatorName": "Lotto Kadoo",
      "drawDate": "2025-10-30",
      "winningNumbers": [12, 34, 56, 78, 90],
      "playerNumbers": "12, 34",
      "matchCount": 2,
      "winAmount": 500000,
      "timestamp": "2025-10-30T18:15:00.000Z",
      "read": false
    },
    {
      "id": "notif_1730135000000_n2",
      "userId": "user_1730217600000_abc123",
      "drawId": "draw_1730000000000_old123",
      "operatorName": "Bénin Lotto",
      "drawDate": "2025-10-29",
      "winningNumbers": [10, 20, 30, 40, 50],
      "playerNumbers": "5, 15, 25",
      "matchCount": 0,
      "winAmount": 0,
      "timestamp": "2025-10-29T20:15:00.000Z",
      "read": true
    }
  ]
}
```

### 2. Marquer comme lu

**Request:**
```http
PUT /api/notifications/notif_1730304000000_n1/read
Authorization: Bearer {user_token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marquée comme lue",
  "data": {
    "id": "notif_1730304000000_n1",
    "read": true
  }
}
```

---

## 📊 ADMIN DASHBOARD

### 1. Stats du jour

**Request:**
```http
GET /api/admin/stats/dashboard
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 3850000,
    "totalWinnings": 2450000,
    "totalProfit": 1400000,
    "newPlayers": 47,
    "activePlayers": 1203,
    "totalPlayers": 5847,
    "totalBets": 1547,
    "avgBetAmount": 2489,
    "date": "2025-10-29"
  }
}
```

### 2. Revenus des 7 derniers jours

**Request:**
```http
GET /api/admin/stats/revenue?days=7
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "day": "Lundi",
      "date": "2025-10-23",
      "amount": 2150000
    },
    {
      "day": "Mardi",
      "date": "2025-10-24",
      "amount": 2890000
    },
    {
      "day": "Mercredi",
      "date": "2025-10-25",
      "amount": 3120000
    },
    {
      "day": "Jeudi",
      "date": "2025-10-26",
      "amount": 2780000
    },
    {
      "day": "Vendredi",
      "date": "2025-10-27",
      "amount": 4250000
    },
    {
      "day": "Samedi",
      "date": "2025-10-28",
      "amount": 5890000
    },
    {
      "day": "Dimanche",
      "date": "2025-10-29",
      "amount": 3850000
    }
  ]
}
```

### 3. Stats par opérateur

**Request:**
```http
GET /api/admin/stats/operators
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "operatorId": "togo-kadoo",
      "name": "Lotto Kadoo",
      "color": "#FFD700",
      "totalBets": 547,
      "totalRevenue": 1250000,
      "percentage": 32
    },
    {
      "operatorId": "benin-lotto",
      "name": "Bénin Lotto",
      "color": "#FF6B00",
      "totalBets": 423,
      "totalRevenue": 980000,
      "percentage": 27
    },
    {
      "operatorId": "ivoire-lonaci",
      "name": "Lonaci",
      "color": "#4F00BC",
      "totalBets": 312,
      "totalRevenue": 780000,
      "percentage": 20
    },
    {
      "operatorId": "nigeria-greenlotto",
      "name": "Green Lotto",
      "color": "#009DD9",
      "totalBets": 189,
      "totalRevenue": 520000,
      "percentage": 12
    },
    {
      "operatorId": "senegal-pmu",
      "name": "PMU Sénégal",
      "color": "#00A651",
      "totalBets": 76,
      "totalRevenue": 320000,
      "percentage": 9
    }
  ]
}
```

### 4. Combinaisons à risque

**Request:**
```http
GET /api/admin/stats/combinations?period=today&limit=10
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "critical": 2,
      "high": 5,
      "medium": 18,
      "low": 247
    },
    "topRisks": [
      {
        "combination": "12, 34, 56, 78, 90",
        "betCount": 87,
        "totalStaked": 145000,
        "potentialPayout": 14500000,
        "riskLevel": "critical",
        "affectedDraws": ["draw_1730217600000_def456"]
      },
      {
        "combination": "7, 14, 21, 28, 35",
        "betCount": 54,
        "totalStaked": 98000,
        "potentialPayout": 9800000,
        "riskLevel": "high",
        "affectedDraws": ["draw_1730217600000_def456", "draw_1730304000000_ghi789"]
      },
      {
        "combination": "1, 2, 3, 4, 5",
        "betCount": 42,
        "totalStaked": 67000,
        "potentialPayout": 6700000,
        "riskLevel": "high",
        "affectedDraws": ["draw_1730217600000_def456"]
      }
    ]
  }
}
```

---

## ❌ GESTION D'ERREURS

### Format standard d'erreur:

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Solde insuffisant pour effectuer ce pari",
    "details": {
      "required": 5000,
      "available": 3000
    }
  }
}
```

### Codes d'erreur courants:

```javascript
// Authentification (401)
INVALID_CREDENTIALS
TOKEN_EXPIRED
UNAUTHORIZED

// Validation (400)
INVALID_INPUT
MISSING_REQUIRED_FIELD
INVALID_PHONE_NUMBER
INVALID_BET_TYPE
INVALID_NUMBERS
DUPLICATE_NUMBERS

// Business Logic (400)
INSUFFICIENT_BALANCE
DRAW_NOT_FOUND
DRAW_CLOSED
DRAW_ALREADY_COMPLETED
TICKET_NOT_FOUND
PLAYER_NOT_FOUND
RESELLER_NOT_FOUND
MINIMUM_BET_NOT_MET
MAXIMUM_BET_EXCEEDED
WITHDRAWAL_MINIMUM_NOT_MET

// Permissions (403)
FORBIDDEN
ACCOUNT_SUSPENDED
ROLE_NOT_AUTHORIZED

// Serveur (500)
INTERNAL_SERVER_ERROR
DATABASE_ERROR
PAYMENT_PROCESSING_ERROR
```

### Exemples d'erreurs:

**1. Solde insuffisant:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Solde insuffisant pour effectuer ce pari",
    "details": {
      "required": 5000,
      "available": 3000
    }
  }
}
```

**2. Tirage fermé:**
```json
{
  "success": false,
  "error": {
    "code": "DRAW_CLOSED",
    "message": "Ce tirage est fermé aux nouveaux paris",
    "details": {
      "drawId": "draw_1730217600000_def456",
      "drawTime": "2025-10-30T18:00:00.000Z",
      "currentTime": "2025-10-30T18:05:00.000Z"
    }
  }
}
```

**3. Numéros invalides:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_NUMBERS",
    "message": "Les numéros doivent être entre 1 et 90",
    "details": {
      "provided": [12, 34, 95],
      "invalid": [95],
      "poolRange": [1, 90]
    }
  }
}
```

**4. Compte suspendu:**
```json
{
  "success": false,
  "error": {
    "code": "ACCOUNT_SUSPENDED",
    "message": "Votre compte a été suspendu. Contactez le support.",
    "details": {
      "userId": "user_1730217600000_abc123",
      "reason": "Activité suspecte détectée",
      "suspendedAt": "2025-10-29T12:00:00.000Z"
    }
  }
}
```

---

## 🔄 WEBHOOKS (Optionnel)

Si vous implémentez des webhooks pour notifier le frontend en temps réel:

### 1. Nouveau gain

```json
{
  "event": "win.created",
  "timestamp": "2025-10-30T18:15:00.000Z",
  "data": {
    "userId": "user_1730217600000_abc123",
    "ticketId": "ticket_1730220000000_abc123",
    "drawId": "draw_1730217600000_def456",
    "winAmount": 500000,
    "newBalance": 1012500
  }
}
```

### 2. Retrait approuvé

```json
{
  "event": "withdrawal.approved",
  "timestamp": "2025-10-29T17:45:00.000Z",
  "data": {
    "userId": "user_1730217600000_abc123",
    "withdrawalId": "withdraw_1730226000000_wd1",
    "amount": 50000,
    "provider": "TMoney"
  }
}
```

### 3. Tirage complété

```json
{
  "event": "draw.completed",
  "timestamp": "2025-10-30T18:15:00.000Z",
  "data": {
    "drawId": "draw_1730217600000_def456",
    "operatorId": "togo-kadoo",
    "winningNumbers": [12, 34, 56, 78, 90],
    "totalWinners": 89,
    "totalWinnings": 2450000
  }
}
```

---

## 🧪 DONNÉES DE TEST

### Comptes de test:

```json
// Joueur 1
{
  "email": "test.player1@lotohappy.com",
  "password": "TestPlayer123!",
  "phoneNumber": "+22890123456",
  "balanceGame": 10000,
  "balanceWinnings": 50000
}

// Joueur 2
{
  "email": "test.player2@lotohappy.com",
  "password": "TestPlayer123!",
  "phoneNumber": "+22990123456",
  "balanceGame": 5000,
  "balanceWinnings": 0
}

// Revendeur
{
  "email": "test.reseller@lotohappy.com",
  "password": "TestReseller123!",
  "phoneNumber": "+22890999999",
  "tokenBalance": 100000
}

// Admin
{
  "email": "test.admin@lotohappy.com",
  "password": "TestAdmin123!",
  "role": "Super Admin"
}
```

### Tirages de test:

```json
[
  {
    "id": "test_draw_upcoming",
    "operatorId": "togo-kadoo",
    "date": "2025-11-01",
    "time": "18:00",
    "status": "upcoming"
  },
  {
    "id": "test_draw_pending",
    "operatorId": "benin-lotto",
    "date": "2025-10-29",
    "time": "14:00",
    "status": "pending"
  },
  {
    "id": "test_draw_completed",
    "operatorId": "ivoire-lonaci",
    "date": "2025-10-28",
    "time": "20:00",
    "status": "completed",
    "winningNumbers": [12, 34, 56, 78, 90]
  }
]
```

---

**Fin des exemples API - Version 1.0**

Ces exemples couvrent tous les cas d'usage principaux. Pour les cas d'edge et erreurs spécifiques, référez-vous à BACKEND_SPECIFICATIONS.md.
