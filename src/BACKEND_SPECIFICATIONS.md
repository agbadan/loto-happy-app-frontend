# 📋 SPÉCIFICATIONS BACKEND - LOTO HAPPY

**Date:** 29 Octobre 2025  
**Version:** 1.0  
**Application:** Loto Happy - Agrégateur de Loteries Ouest Africain

---

## 🎯 VUE D'ENSEMBLE

Loto Happy est une application de loterie premium pour l'Afrique de l'Ouest avec:
- **5 opérateurs de loterie** (Togo, Bénin, Côte d'Ivoire, Nigeria, Sénégal)
- **9 types de paris avancés** (NAP1-NAP5, PERMUTATION, BANKA, CHANCE+, ANAGRAMME)
- **3 rôles utilisateurs**: Joueur, Revendeur, Admin
- **Système de double solde**: Solde de Jeu + Solde des Gains
- **Design**: Thème sombre (#121212, #1C1C1E) avec accents or (#FFD700), orange (#FF6B00), violet (#4F00BC)

---

## 📊 STRUCTURE DES DONNÉES

### 1. UTILISATEURS

#### Interface User (Base commune)
```typescript
interface User {
  id: string;                          // UUID généré par le backend
  username: string;                    // UNIQUE
  phoneNumber: string;                 // UNIQUE, format: +228XXXXXXXX
  email: string;                       // UNIQUE, REQUIS
  password: string;                    // Hashé (bcrypt/argon2)
  authMethod: 'password' | 'google';   // Méthode d'authentification
  role: 'player' | 'reseller' | 'admin';
  status: 'active' | 'suspended';      // Pour modération admin
  createdAt: string;                   // ISO timestamp
  lastLogin: string;                   // ISO timestamp
}
```

#### Interface Player (extends User)
```typescript
interface Player extends User {
  role: 'player';
  balanceGame: number;                 // Solde pour jouer (F CFA)
  balanceWinnings: number;             // Solde des gains (F CFA)
  playerTransactionHistory: PlayerTransaction[];
}
```

#### Interface Reseller (extends User)
```typescript
interface Reseller extends User {
  role: 'reseller';
  balanceGame: number;                 // Non utilisé pour revendeur
  balanceWinnings: number;             // Non utilisé pour revendeur
  tokenBalance: number;                // Solde en tokens pour créditer les joueurs
  dailyRechargeTotal: number;          // Montant total rechargé aujourd'hui
  dailyTransactionsCount: number;      // Nombre de transactions aujourd'hui
  transactionHistory: ResellerTransaction[];
}
```

#### Interface Admin
```typescript
interface AdminUser {
  id: string;
  username: string;
  email: string;
  password: string;                    // Hashé
  role: 'Super Admin' | 'Admin Financier' | 'Admin du Jeu' | 'Support Client';
  status: 'Actif' | 'Désactivé';
  lastLogin: string;
  createdAt: string;
}
```

### 2. TRANSACTIONS

#### PlayerTransaction
```typescript
interface PlayerTransaction {
  id: string;
  userId: string;                      // Référence au joueur
  type: 'RECHARGE' | 'BET' | 'CONVERSION' | 'WIN' | 'WITHDRAWAL';
  description: string;                 // Ex: "Rechargé via Revendeur: John Doe"
  amount: number;                      // Montant en F CFA
  balanceAfter: number;                // Solde après transaction
  date: string;                        // ISO timestamp
  metadata?: {
    gameName?: string;                 // Nom de l'opérateur
    resellerName?: string;             // Nom du revendeur (pour RECHARGE)
    fromBalance?: 'winnings' | 'game'; // Pour CONVERSION
    toBalance?: 'winnings' | 'game';   // Pour CONVERSION
    provider?: string;                 // Opérateur Mobile Money (pour WITHDRAWAL)
    phoneNumber?: string;              // Numéro de retrait (pour WITHDRAWAL)
  };
}
```

#### ResellerTransaction
```typescript
interface ResellerTransaction {
  id: string;
  resellerId: string;                  // ID du revendeur
  playerId: string;                    // ID du joueur crédité
  playerNumber: string;                // Numéro de téléphone du joueur
  playerUsername: string;              // Nom du joueur
  amount: number;                      // Montant crédité
  date: string;                        // ISO timestamp
}
```

### 3. OPÉRATEURS & TIRAGES

#### Operator (Configuration statique)
```typescript
interface Operator {
  id: string;                          // Ex: 'togo-kadoo'
  name: string;                        // Ex: 'Lotto Kadoo'
  country: string;                     // Ex: 'Togo'
  countryCode: string;                 // Ex: '+228'
  icon: string;                        // Emoji
  color: string;                       // Couleur hex
  numbersPool: number;                 // Pool de numéros (ex: 90 = 1-90)
  numbersDrawn: number;                // Toujours 5
  minBet: number;                      // Mise min (ex: 100)
  maxBet: number;                      // Mise max (ex: 50000)
}
```

**Les 5 opérateurs:**
1. **Lotto Kadoo** (Togo) - #FFD700
2. **Bénin Lotto** (Bénin) - #FF6B00
3. **Lonaci** (Côte d'Ivoire) - #4F00BC
4. **Green Lotto** (Nigeria) - #009DD9
5. **PMU Sénégal** (Sénégal) - #00A651

#### Draw (Tirage créé par admin)
```typescript
interface Draw {
  id: string;                          // UUID
  operatorId: string;                  // Référence à Operator
  date: string;                        // Format: "2025-10-29"
  time: string;                        // Format: "14:30"
  status: 'upcoming' | 'pending' | 'completed';
  
  // Multiplicateurs pour ce tirage spécifique
  multipliers: {
    NAP1?: number;        // x10 par défaut
    NAP2?: number;        // x500 par défaut
    NAP3?: number;        // x5000 par défaut
    NAP4?: number;        // x25000 par défaut
    NAP5?: number;        // x100000 par défaut
    PERMUTATION?: number; // x250 par défaut
    BANKA?: number;       // x150 par défaut
    CHANCE_PLUS?: number; // x2000 par défaut
    ANAGRAMME?: number;   // x10 par défaut
  };
  
  winningNumbers: number[];            // Les 5 numéros gagnants (vide si pas encore tiré)
  createdAt: string;                   // ISO timestamp
  createdBy: string;                   // ID de l'admin créateur
}
```

**Logique de statut:**
- `upcoming`: Tirage futur
- `pending`: Heure du tirage passée, en attente des résultats
- `completed`: Résultats publiés

### 4. PARIS (TICKETS)

#### Ticket
```typescript
interface Ticket {
  id: string;                          // UUID
  userId: string;                      // Référence au joueur
  username: string;                    // Nom du joueur
  drawId: string;                      // Référence au tirage
  
  // Type de pari
  betType: 'NAP1' | 'NAP2' | 'NAP3' | 'NAP4' | 'NAP5' | 
           'PERMUTATION' | 'BANKA' | 'CHANCE_PLUS' | 'ANAGRAMME';
  
  // Numéros choisis
  numbers: string;                     // Ex: "12, 34, 56"
  betAmount: number;                   // Mise en F CFA
  purchaseDate: string;                // ISO timestamp
  
  // Statut et gains
  status: 'pending' | 'won' | 'lost';
  winAmount?: number;                  // Montant gagné (si gagnant)
  
  // Champs spécifiques aux types de paris
  baseNumber?: number;                 // Pour BANKA uniquement
  associatedNumbers?: number[];        // Pour BANKA uniquement
  position?: 'first' | 'last';         // Pour CHANCE_PLUS uniquement
  combinations?: number[][];           // Pour PERMUTATION uniquement (générées côté front)
}
```

### 5. DEMANDES DE RETRAIT

#### WithdrawalRequest
```typescript
interface WithdrawalRequest {
  id: string;                          // UUID
  userId: string;                      // Référence au joueur
  username: string;                    // Nom du joueur
  phoneNumber: string;                 // Numéro du joueur (pour contact)
  amount: number;                      // Montant à retirer
  provider: string;                    // Opérateur Mobile Money (TMoney, Flooz, MTN, Orange, Wave)
  withdrawalPhoneNumber: string;       // Numéro vers lequel envoyer l'argent
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;                 // ISO timestamp
  processedDate?: string;              // ISO timestamp (quand traité)
  processedBy?: string;                // ID de l'admin qui a traité
}
```

### 6. NOTIFICATIONS DE GAINS

#### WinNotification
```typescript
interface WinNotification {
  id: string;                          // UUID
  userId: string;                      // Référence au joueur
  drawId: string;                      // Référence au tirage
  operatorName: string;                // Nom de l'opérateur
  drawDate: string;                    // Date du tirage
  winningNumbers: number[];            // Les 5 numéros gagnants
  playerNumbers: string;               // Numéros du joueur
  matchCount: number;                  // Nombre de numéros matchés
  winAmount: number;                   // Montant gagné
  timestamp: string;                   // ISO timestamp
  read: boolean;                       // Lu ou non
}
```

---

## 🔐 AUTHENTIFICATION

### Méthodes supportées:
1. **Email/Password** (joueurs, revendeurs, admins)
2. **Google OAuth** (joueurs uniquement)
3. **Téléphone/Password** (revendeurs uniquement - login simplifié)

### Validation des numéros:

```typescript
const PHONE_FORMATS = [
  { code: '+228', length: 8, name: 'Togo' },
  { code: '+229', length: 8, name: 'Bénin' },
  { code: '+225', length: 10, name: 'Côte d\'Ivoire' },
  { code: '+233', length: 9, name: 'Ghana' },
  { code: '+226', length: 8, name: 'Burkina Faso' },
];
```

### Endpoints requis:

```
POST /auth/register
POST /auth/login
POST /auth/google
POST /auth/logout
POST /auth/refresh-token
GET  /auth/me
PUT  /auth/change-password
```

---

## 💰 SYSTÈME DE SOLDES

### Pour les JOUEURS (2 soldes):

1. **Solde de Jeu** (`balanceGame`)
   - Utilisé pour acheter des tickets
   - Rechargé via revendeurs
   - Peut être converti depuis le Solde des Gains

2. **Solde des Gains** (`balanceWinnings`)
   - Reçoit les gains automatiquement
   - Peut être retiré (Mobile Money)
   - Peut être converti en Solde de Jeu

### Pour les REVENDEURS:

1. **Solde Tokens** (`tokenBalance`)
   - Utilisé pour créditer les comptes joueurs
   - 1 Token = 1 F CFA
   - Rechargé par l'admin (hors scope - gestion manuelle)

### Règles de conversion:
- **Gains → Jeu**: Taux 1:1 (100% du montant)
- **Jeu → Gains**: INTERDIT

---

## 🎮 TYPES DE PARIS (9 types)

### Configuration par défaut:

```typescript
const BET_TYPES_CONFIG = {
  NAP1: {
    name: 'Simple Numéro',
    minNumbers: 1,
    maxNumbers: 1,
    defaultMultiplier: 10        // x10
  },
  NAP2: {
    name: 'Deux Numéros (Two Sure)',
    minNumbers: 2,
    maxNumbers: 2,
    defaultMultiplier: 500       // x500
  },
  NAP3: {
    name: 'Trois Numéros',
    minNumbers: 3,
    maxNumbers: 3,
    defaultMultiplier: 5000      // x5000
  },
  NAP4: {
    name: 'Quatre Numéros',
    minNumbers: 4,
    maxNumbers: 4,
    defaultMultiplier: 25000     // x25000
  },
  NAP5: {
    name: 'Cinq Numéros',
    minNumbers: 5,
    maxNumbers: 5,
    defaultMultiplier: 100000    // x100000
  },
  PERMUTATION: {
    name: 'Permutation (Combinaisons Auto)',
    minNumbers: 3,
    maxNumbers: 10,
    defaultMultiplier: 250,      // x250
    autoGeneratesCombinations: true
  },
  BANKA: {
    name: 'Banka (Numéro de Base + Autres)',
    minNumbers: 2,               // 1 base + au moins 1 autre
    maxNumbers: 6,               // 1 base + 5 autres max
    defaultMultiplier: 150,      // x150
    requiresBase: true
  },
  CHANCE_PLUS: {
    name: 'Position Exacte (Premier/Dernier)',
    minNumbers: 1,
    maxNumbers: 1,
    defaultMultiplier: 2000,     // x2000
    requiresPosition: true
  },
  ANAGRAMME: {
    name: 'Numéros Inversés (12 et 21)',
    minNumbers: 1,
    maxNumbers: 1,
    defaultMultiplier: 10        // x10 (couvre 2 numéros)
  }
};
```

---

## 🏆 CALCUL DES GAINS

### Logique de vérification:

#### NAP1 à NAP5:
```
Si TOUS les numéros du joueur sont dans les 5 numéros gagnants
→ Gain = mise × multiplicateur
```

#### PERMUTATION:
```
Pour chaque combinaison générée:
  Si TOUS les numéros de la combinaison sont dans les 5 gagnants
  → Gain = (mise ÷ nombre_combinaisons) × multiplicateur
```

#### BANKA:
```
Si le numéro de base ET au moins 1 autre numéro associé sont dans les gagnants
→ Gain = mise × multiplicateur
```

#### CHANCE_PLUS:
```
Si le numéro du joueur est à la position exacte (premier ou dernier)
→ Gain = mise × multiplicateur
```

#### ANAGRAMME:
```
Si le numéro OU son inversé est dans les gagnants
→ Gain = mise × multiplicateur
Exemple: Joueur mise sur 12
  - Si 12 est tiré → Gagne
  - Si 21 est tiré → Gagne
```

### Distribution automatique:
- Lorsqu'un tirage passe à `completed`, calculer tous les gains
- Créditer automatiquement `balanceWinnings` des gagnants
- Créer les `WinNotification`
- Créer les transactions `type: 'WIN'`
- Mettre à jour le statut des tickets (`won` ou `lost`)

---

## 🔄 ENDPOINTS API REQUIS

### Authentication
```
POST   /api/auth/register              # Inscription (joueur/revendeur)
POST   /api/auth/login                 # Connexion
POST   /api/auth/google                # Connexion Google OAuth
POST   /api/auth/logout                # Déconnexion
POST   /api/auth/refresh               # Refresh token
GET    /api/auth/me                    # Infos utilisateur connecté
PUT    /api/auth/change-password       # Changer mot de passe
```

### Players
```
GET    /api/players                    # Liste tous les joueurs (admin)
GET    /api/players/:id                # Détails d'un joueur
PUT    /api/players/:id                # Modifier un joueur
DELETE /api/players/:id                # Supprimer un joueur (admin)
GET    /api/players/:id/transactions   # Historique transactions joueur
POST   /api/players/:id/convert        # Convertir Gains → Jeu
POST   /api/players/:id/suspend        # Suspendre un joueur (admin)
```

### Resellers
```
GET    /api/resellers                  # Liste tous les revendeurs (admin)
GET    /api/resellers/:id              # Détails d'un revendeur
POST   /api/resellers                  # Créer un revendeur (admin)
PUT    /api/resellers/:id              # Modifier un revendeur
DELETE /api/resellers/:id              # Supprimer un revendeur (admin)
POST   /api/resellers/:id/credit-player # Créditer un joueur
GET    /api/resellers/:id/transactions # Historique transactions revendeur
PUT    /api/resellers/:id/tokens       # Recharger tokens revendeur (admin)
```

### Operators
```
GET    /api/operators                  # Liste des 5 opérateurs
GET    /api/operators/:id              # Détails d'un opérateur
```

### Draws
```
GET    /api/draws                      # Liste de tous les tirages
GET    /api/draws/:id                  # Détails d'un tirage
POST   /api/draws                      # Créer un tirage (admin)
PUT    /api/draws/:id                  # Modifier un tirage (admin)
DELETE /api/draws/:id                  # Supprimer un tirage (admin)
PUT    /api/draws/:id/results          # Publier les résultats (admin)
GET    /api/draws/upcoming             # Tirages à venir
GET    /api/draws/pending              # Tirages en attente de résultats
GET    /api/draws/completed            # Tirages terminés
```

### Tickets
```
GET    /api/tickets                    # Liste des tickets (admin)
GET    /api/tickets/:id                # Détails d'un ticket
POST   /api/tickets                    # Acheter un ticket (joueur)
GET    /api/tickets/user/:userId       # Tickets d'un joueur
GET    /api/tickets/draw/:drawId       # Tickets d'un tirage
DELETE /api/tickets/:id                # Supprimer un ticket (admin - avant tirage)
```

### Withdrawals
```
GET    /api/withdrawals                # Liste demandes de retrait (admin)
POST   /api/withdrawals                # Demander un retrait (joueur)
PUT    /api/withdrawals/:id/approve    # Approuver un retrait (admin)
PUT    /api/withdrawals/:id/reject     # Rejeter un retrait (admin)
GET    /api/withdrawals/user/:userId   # Demandes d'un joueur
```

### Notifications
```
GET    /api/notifications/user/:userId # Notifications d'un joueur
PUT    /api/notifications/:id/read     # Marquer comme lu
DELETE /api/notifications/:id          # Supprimer une notification
```

### Admin Dashboard
```
GET    /api/admin/stats/dashboard      # KPIs du jour
GET    /api/admin/stats/revenue        # Revenus des 7 derniers jours
GET    /api/admin/stats/operators      # Stats par opérateur
GET    /api/admin/stats/combinations   # Combinaisons à risque
GET    /api/admin/users                # Liste tous les utilisateurs
POST   /api/admin/users                # Créer un admin
PUT    /api/admin/users/:id            # Modifier un admin
DELETE /api/admin/users/:id            # Supprimer un admin
```

---

## 📅 LOGIQUES MÉTIER CRITIQUES

### 1. Création d'un ticket (Pari)
```
1. Vérifier que le joueur est connecté
2. Vérifier que le tirage existe et est 'upcoming'
3. Vérifier que le joueur a assez dans balanceGame
4. Valider les numéros selon le type de pari
5. Déduire le montant du balanceGame
6. Créer le ticket
7. Créer la transaction type 'BET'
8. Retourner le ticket créé
```

### 2. Publication des résultats d'un tirage
```
1. Vérifier que le tirage est 'pending'
2. Valider les 5 numéros gagnants (1-90, uniques)
3. Mettre à jour draw.winningNumbers et draw.status = 'completed'
4. Pour chaque ticket de ce tirage:
   a. Calculer si gagnant selon le type de pari
   b. Si gagnant:
      - Calculer winAmount = mise × multiplicateur
      - Créditer balanceWinnings du joueur
      - Créer transaction type 'WIN'
      - Créer WinNotification
      - Mettre ticket.status = 'won'
   c. Sinon:
      - Mettre ticket.status = 'lost'
5. Sauvegarder toutes les modifications
```

### 3. Recharge par revendeur
```
1. Vérifier que le revendeur est connecté
2. Vérifier que le joueur existe (via phoneNumber)
3. Vérifier que le revendeur a assez de tokens
4. Déduire du tokenBalance du revendeur
5. Créditer le balanceGame du joueur
6. Créer transaction pour le joueur (type 'RECHARGE')
7. Créer transaction pour le revendeur
8. Incrémenter dailyRechargeTotal et dailyTransactionsCount
9. Retourner succès
```

### 4. Conversion Gains → Jeu
```
1. Vérifier que le joueur est connecté
2. Vérifier que montant <= balanceWinnings
3. Déduire du balanceWinnings
4. Créditer le balanceGame
5. Créer transaction type 'CONVERSION'
6. Retourner nouveaux soldes
```

### 5. Demande de retrait
```
1. Vérifier que le joueur est connecté
2. Vérifier que montant <= balanceWinnings
3. Vérifier que montant >= 1000 F (minimum)
4. Déduire immédiatement du balanceWinnings
5. Créer WithdrawalRequest status = 'pending'
6. Créer transaction type 'WITHDRAWAL'
7. Notifier les admins
8. Retourner la demande créée
```

### 6. Traitement d'un retrait (Admin)
```
Si approuvé:
  - Marquer status = 'approved'
  - Enregistrer processedDate et processedBy
  - (Le joueur a déjà été débité lors de la demande)

Si rejeté:
  - Marquer status = 'rejected'
  - RE-CRÉDITER le balanceWinnings du joueur
  - Créer transaction type 'REFUND'
  - Enregistrer processedDate et processedBy
```

---

## 🔒 SÉCURITÉ & VALIDATION

### Validation des données:

#### Numéros de téléphone:
```
Format: +[code pays][numéro]
Exemples valides:
  - +22812345678 (Togo - 8 chiffres)
  - +22912345678 (Bénin - 8 chiffres)
  - +2251234567890 (Côte d'Ivoire - 10 chiffres)
```

#### Emails:
```
Regex standard email
Format: xxx@xxx.xxx
```

#### Numéros de loterie:
```
Pour TOUS les types de paris:
  - Minimum: 1
  - Maximum: 90 (numbersPool de l'opérateur)
  - Pas de doublons
  - Pour ANAGRAMME: Accepter 11-19, 21-29, ..., 81-89 uniquement
```

#### Montants:
```
Mises:
  - Minimum: 100 F (minBet de l'opérateur)
  - Maximum: 50000 F (maxBet de l'opérateur)
  
Retraits:
  - Minimum: 1000 F
  - Maximum: balanceWinnings du joueur
```

### Permissions:

```
Joueur:
  - Acheter des tickets
  - Voir ses paris/gains
  - Demander des retraits
  - Convertir gains → jeu

Revendeur:
  - Créditer les comptes joueurs
  - Voir son historique de transactions
  - Modifier son profil

Admin:
  - Créer/modifier/supprimer des tirages
  - Publier les résultats
  - Gérer les utilisateurs (joueurs, revendeurs, admins)
  - Traiter les demandes de retrait
  - Voir toutes les statistiques
  - Suspendre des comptes
```

---

## 📈 STATISTIQUES & ANALYTICS

### KPIs Dashboard Admin (temps réel):

```typescript
interface DashboardStats {
  // Financiers
  totalRevenue: number;           // CA du jour (total des mises)
  totalWinnings: number;          // Gains payés du jour
  totalProfit: number;            // Bénéfice brut (revenue - winnings)
  
  // Utilisateurs
  newPlayers: number;             // Nouveaux joueurs du jour
  activePlayers: number;          // Joueurs ayant parié aujourd'hui
  totalPlayers: number;           // Total joueurs
  
  // Paris
  totalBets: number;              // Nombre de paris du jour
  avgBetAmount: number;           // Mise moyenne
  
  // Par opérateur
  operatorStats: {
    operatorId: string;
    name: string;
    totalBets: number;
    totalRevenue: number;
    percentage: number;           // % du total
  }[];
}
```

### Combinaisons à risque (anti-fraude):

Identifier les combinaisons avec trop de paris pour limiter l'exposition:

```typescript
interface RiskCombination {
  combination: string;            // Ex: "12, 34, 56, 78, 90"
  betCount: number;               // Nombre de paris sur cette combinaison
  totalStaked: number;            // Total des mises
  potentialPayout: number;        // Gain potentiel si cette combinaison sort
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedDraws: string[];        // IDs des tirages concernés
}
```

**Seuils de risque:**
- `low`: potentialPayout < 1,000,000 F
- `medium`: 1M - 5M F
- `high`: 5M - 10M F
- `critical`: > 10M F

---

## 🌍 OPÉRATEURS MOBILE MONEY

```typescript
const MOBILE_MONEY_PROVIDERS = [
  { id: 'tmoney', name: 'TMoney', countries: ['Togo'] },
  { id: 'flooz', name: 'Flooz', countries: ['Togo', 'Bénin'] },
  { id: 'mtn', name: 'MTN Mobile Money', countries: ['Togo', 'Bénin', 'Côte d\'Ivoire', 'Ghana'] },
  { id: 'orange', name: 'Orange Money', countries: ['Côte d\'Ivoire', 'Sénégal'] },
  { id: 'wave', name: 'Wave', countries: ['Sénégal', 'Côte d\'Ivoire'] },
  { id: 'moov', name: 'Moov Money', countries: ['Togo', 'Bénin', 'Côte d\'Ivoire'] }
];
```

---

## 🗄️ BASE DE DONNÉES

### Collections/Tables recommandées:

```
users              # Tous les utilisateurs (joueurs, revendeurs, admins)
draws              # Tous les tirages
tickets            # Tous les paris
transactions       # Toutes les transactions (joueurs + revendeurs)
withdrawalRequests # Demandes de retrait
winNotifications   # Notifications de gains
```

### Indexes recommandés:

```
users:
  - email (unique)
  - phoneNumber (unique)
  - username (unique)
  - role
  - status

draws:
  - operatorId
  - status
  - date (desc)

tickets:
  - userId
  - drawId
  - status
  - purchaseDate (desc)

transactions:
  - userId
  - type
  - date (desc)

withdrawalRequests:
  - userId
  - status
  - requestDate (desc)

winNotifications:
  - userId
  - read
  - timestamp (desc)
```

---

## 🔄 MIGRATION DES DONNÉES

### État actuel (Frontend - localStorage):

Actuellement, TOUTES les données sont stockées dans le localStorage du navigateur:

```javascript
localStorage keys:
  - loto_happy_users           # Tous les users (joueurs + revendeurs)
  - loto_happy_draws           # Tous les tirages
  - loto_happy_tickets         # Tous les paris
  - loto_happy_withdrawal_requests # Demandes de retrait
  - loto_happy_win_notifications   # Notifications de gains
  - lottoHappyUser            # Session utilisateur actuel
  - lottoHappyAdmins          # Administrateurs
```

### Plan de migration:

1. **Exporter les données existantes** du localStorage
2. **Valider et nettoyer** les données
3. **Importer dans la base de données backend**
4. **Tester l'intégration** frontend ↔ backend
5. **Basculer du localStorage aux API calls**
6. **Déployer progressivement**

---

## 🎨 DESIGN & THÈME

### Couleurs principales:
```css
/* Fond */
--background: #121212
--card: #1C1C1E

/* Accents */
--gold: #FFD700      /* Boutons primaires, highlights */
--orange: #FF6B00    /* Alertes, gains */
--violet: #4F00BC    /* Secondaire */
--green: #00A651     /* Succès */
--red: #FF3B30       /* Erreurs */

/* Opérateurs */
--togo: #FFD700
--benin: #FF6B00
--ivoire: #4F00BC
--nigeria: #009DD9
--senegal: #00A651
```

### Modes supportés:
- Dark mode (par défaut)
- Light mode
- System (suit les préférences OS)

---

## ✅ CHECKLIST BACKEND

### Phase 1 - Infrastructure
- [ ] Setup du serveur (Node.js/Express ou autre)
- [ ] Configuration base de données (MongoDB/PostgreSQL)
- [ ] Système d'authentification (JWT)
- [ ] Hashage des mots de passe (bcrypt/argon2)
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Logging (Winston/Morgan)

### Phase 2 - Authentification
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] POST /auth/google
- [ ] POST /auth/logout
- [ ] GET /auth/me
- [ ] PUT /auth/change-password
- [ ] Middleware authentification
- [ ] Middleware autorisation (roles)

### Phase 3 - Gestion Utilisateurs
- [ ] CRUD Players
- [ ] CRUD Resellers
- [ ] CRUD Admins
- [ ] Système de suspension
- [ ] Historique transactions

### Phase 4 - Système de Jeu
- [ ] CRUD Operators (lecture seule sauf admin)
- [ ] CRUD Draws
- [ ] Création de tickets
- [ ] Validation des paris
- [ ] Calcul des combinaisons (PERMUTATION)

### Phase 5 - Système de Gains
- [ ] Calcul automatique des gains
- [ ] Distribution automatique
- [ ] Notifications de gains
- [ ] Historique des gains

### Phase 6 - Transactions
- [ ] Recharge via revendeur
- [ ] Conversion Gains → Jeu
- [ ] Demandes de retrait
- [ ] Traitement des retraits (admin)
- [ ] Historique complet

### Phase 7 - Dashboard Admin
- [ ] KPIs temps réel
- [ ] Graphiques revenus
- [ ] Stats par opérateur
- [ ] Combinaisons à risque
- [ ] Gestion des utilisateurs

### Phase 8 - Sécurité
- [ ] Validation des inputs
- [ ] Protection CSRF
- [ ] Rate limiting par endpoint
- [ ] Logs d'audit
- [ ] Backup automatique

### Phase 9 - Tests
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Tests de charge
- [ ] Tests de sécurité

### Phase 10 - Déploiement
- [ ] CI/CD pipeline
- [ ] Environnements (dev/staging/prod)
- [ ] Monitoring (Sentry/NewRelic)
- [ ] Documentation API (Swagger)

---

## 📞 POINTS DE SYNCHRONISATION

### Questions à résoudre ensemble:

1. **Base de données**: MongoDB ou PostgreSQL ?
2. **Hébergement**: AWS, Google Cloud, Azure, ou autre ?
3. **Real-time**: WebSockets pour les notifications ?
4. **Paiements**: Intégration Mobile Money (Fedapay, Stripe Africa) ?
5. **Email**: Service pour les notifications (SendGrid, Mailgun) ?
6. **Storage**: Fichiers/images (S3, Cloudinary) ?
7. **Cache**: Redis pour les sessions ?
8. **Queue**: Bull/RabbitMQ pour les tâches asynchrones ?

### Formats de communication:

**Dates/Heures**: Toujours en ISO 8601
```
2025-10-29T14:30:00.000Z
```

**Montants**: Toujours en centimes (ou nombre entier)
```
10000 F CFA = 10000 (pas 100.00)
```

**IDs**: UUID v4 recommandé
```
550e8400-e29b-41d4-a716-446655440000
```

---

## 📝 NOTES IMPORTANTES

### ⚠️ Points d'attention:

1. **Pas de collecte de PII sensibles** - Figma Make n'est pas conçu pour collecter des données personnelles identifiables

2. **Calcul des gains CRITIQUE** - Vérifier minutieusement la logique de chaque type de pari

3. **Transactions atomiques** - Toujours utiliser des transactions DB pour les opérations financières

4. **Idempotence** - Les endpoints financiers doivent être idempotents (éviter doublons)

5. **Timezone** - Tous les utilisateurs sont en UTC+0 (GMT - Afrique de l'Ouest)

6. **Devise** - Toujours en Francs CFA (F CFA ou XOF)

7. **Langue** - Interface en Français uniquement

8. **Limite journalière revendeurs** - Pas de limite technique, mais tracking pour anti-fraude

9. **Numéros inversés (ANAGRAMME)** - Ne fonctionne QUE pour les numéros à 2 chiffres (11-89, sauf 20,30,40,50,60,70,80)

10. **Auto-refresh** - Dashboard admin se rafraîchit toutes les 10 secondes

---

## 🚀 PROCHAINES ÉTAPES

1. **Backend** développe l'API selon ces specs
2. **Frontend** migre du localStorage vers les API calls
3. **Tests croisés** des intégrations
4. **Déploiement progressif** (dev → staging → prod)
5. **Monitoring** et ajustements

---

**Fin des spécifications - Version 1.0**

Pour toute question ou clarification, consulter les fichiers source du frontend :
- `/utils/auth.ts` - Système d'authentification
- `/utils/games.ts` - Configuration opérateurs et types de paris
- `/utils/draws.ts` - Gestion des tirages et calcul des gains
- `/components/admin/` - Interface d'administration

**Contact**: Via l'équipe frontend Loto Happy
