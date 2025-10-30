# 🤝 HANDOFF BACKEND - LOTO HAPPY

**Date:** 29 Octobre 2025  
**De:** IA Frontend (Figma Make)  
**À:** IA Backend Developer  
**Projet:** Loto Happy - Application de Loterie Premium Ouest Africaine

---

## 📋 RÉSUMÉ EXÉCUTIF

Loto Happy est une application web/mobile complète de loterie qui agrège **5 opérateurs** de loterie d'Afrique de l'Ouest. L'application frontend est **100% fonctionnelle** en standalone avec localStorage, et nous avons besoin d'un backend robuste pour la mise en production.

### État actuel:
- ✅ Frontend React complet et fonctionnel
- ✅ UI/UX optimisée mobile + desktop
- ✅ Système d'authentification (Email/Password + Google OAuth)
- ✅ 9 types de paris avancés implémentés
- ✅ Calcul automatique des gains
- ✅ Dashboard admin avec analytics en temps réel
- ✅ Système de revendeurs fonctionnel
- ⏳ **Données actuellement en localStorage (à migrer vers backend)**

### Ce dont nous avons besoin:
1. **API REST complète** selon les spécifications
2. **Base de données** pour stocker toutes les données
3. **Système d'authentification** avec JWT
4. **Migration des données** existantes du localStorage
5. **Endpoints temps réel** pour les statistiques admin

---

## 📚 DOCUMENTATION FOURNIE

### 1. **BACKEND_SPECIFICATIONS.md** (98 pages)
   - **Contenu**: Spécifications techniques complètes
   - **Inclut**:
     - Toutes les interfaces TypeScript
     - Structure des données
     - Logiques métier critiques
     - Règles de validation
     - Permissions par rôle
     - 60+ endpoints API requis
     - Calcul des gains pour chaque type de pari
     - Système de transactions
     - KPIs et analytics

### 2. **API_EXAMPLES.md** (55 pages)
   - **Contenu**: Exemples concrets requête/réponse pour chaque endpoint
   - **Inclut**:
     - Authentification (register, login, Google OAuth)
     - CRUD pour toutes les entités
     - Cas d'usage courants
     - Gestion d'erreurs standardisée
     - Format des données
     - Données de test

### 3. **DATA_MIGRATION_GUIDE.md** (42 pages)
   - **Contenu**: Guide complet de migration localStorage → Backend
   - **Inclut**:
     - Structure actuelle du localStorage
     - Scripts de transformation
     - Script de migration complet
     - Plan de basculement progressif
     - Checklist de validation
     - Gestion de la sécurité

### 4. **Code Source Frontend** (dans `/utils` et `/components`)
   - **`/utils/auth.ts`**: Système d'authentification complet
   - **`/utils/games.ts`**: Configuration opérateurs et types de paris
   - **`/utils/draws.ts`**: Gestion tirages et calcul gains
   - **`/components/admin/`**: Interface admin (à reproduire côté backend)

---

## 🎯 OBJECTIFS PRINCIPAUX

### Phase 1: Infrastructure (Semaine 1-2)
- [ ] Setup serveur (Node.js/Express recommandé)
- [ ] Configuration base de données (MongoDB ou PostgreSQL)
- [ ] Système d'authentification JWT
- [ ] Endpoints de base (CRUD users, draws, tickets)
- [ ] Tests unitaires

### Phase 2: Business Logic (Semaine 3-4)
- [ ] Implémentation calcul des gains (9 types de paris)
- [ ] Distribution automatique des gains
- [ ] Système de transactions
- [ ] Gestion des revendeurs
- [ ] Endpoints admin

### Phase 3: Migration (Semaine 5)
- [ ] Endpoints de migration sécurisés
- [ ] Migration des données existantes
- [ ] Validation des données migrées
- [ ] Tests d'intégration frontend ↔ backend

### Phase 4: Intégration (Semaine 6)
- [ ] Modification du frontend pour utiliser l'API
- [ ] Tests E2E
- [ ] Optimisations performance
- [ ] Monitoring et logs

### Phase 5: Production (Semaine 7-8)
- [ ] Déploiement sur serveur de production
- [ ] Configuration SSL/HTTPS
- [ ] Backup automatique
- [ ] Documentation API (Swagger)
- [ ] Formation équipe

---

## 🔑 POINTS CRITIQUES

### 1. Calcul des Gains (TRÈS IMPORTANT)

Le calcul des gains est au cœur de l'application. Voici les logiques exactes:

#### NAP1 à NAP5:
```javascript
// Tous les numéros du joueur doivent être dans les 5 numéros gagnants
function checkNAPWin(playerNumbers, winningNumbers, multiplier) {
  const allMatch = playerNumbers.every(num => winningNumbers.includes(num));
  return allMatch ? betAmount * multiplier : 0;
}
```

#### PERMUTATION:
```javascript
// Pour chaque combinaison de 2 numéros générée:
// Si TOUS les numéros de la combinaison sont dans les gagnants
function checkPermutationWin(combinations, winningNumbers, totalBet, multiplier) {
  let totalWin = 0;
  const betPerCombination = totalBet / combinations.length;
  
  combinations.forEach(combo => {
    const allMatch = combo.every(num => winningNumbers.includes(num));
    if (allMatch) {
      totalWin += betPerCombination * multiplier;
    }
  });
  
  return totalWin;
}
```

#### BANKA:
```javascript
// Le numéro de base ET au moins 1 autre numéro associé doivent être gagnants
function checkBankaWin(baseNumber, associatedNumbers, winningNumbers, betAmount, multiplier) {
  const baseIsWinning = winningNumbers.includes(baseNumber);
  const atLeastOneAssociated = associatedNumbers.some(num => winningNumbers.includes(num));
  
  return (baseIsWinning && atLeastOneAssociated) ? betAmount * multiplier : 0;
}
```

#### CHANCE_PLUS:
```javascript
// Le numéro doit être à la position exacte (premier ou dernier)
function checkChancePlusWin(playerNumber, position, winningNumbers, betAmount, multiplier) {
  const targetNumber = position === 'first' ? winningNumbers[0] : winningNumbers[4];
  return playerNumber === targetNumber ? betAmount * multiplier : 0;
}
```

#### ANAGRAMME:
```javascript
// Le numéro OU son inversé doit être dans les gagnants
function checkAnagrammeWin(playerNumber, winningNumbers, betAmount, multiplier) {
  const inverted = invertNumber(playerNumber); // 12 → 21
  const match = winningNumbers.includes(playerNumber) || winningNumbers.includes(inverted);
  return match ? betAmount * multiplier : 0;
}

function invertNumber(num) {
  const str = num.toString();
  return parseInt(str.split('').reverse().join(''));
}
```

### 2. Distribution Automatique des Gains

Quand un tirage passe en `status: 'completed'`:
1. Récupérer TOUS les tickets de ce tirage
2. Pour chaque ticket, calculer le gain selon le type de pari
3. Si gagnant:
   - Créditer `balanceWinnings` du joueur
   - Créer transaction `type: 'WIN'`
   - Créer `WinNotification`
   - Mettre `ticket.status = 'won'` et `ticket.winAmount = X`
4. Sinon:
   - Mettre `ticket.status = 'lost'`

### 3. Système de Double Solde

**IMPORTANT**: Les joueurs ont 2 soldes complètement séparés:

```
balanceGame      → Pour jouer (acheter tickets)
balanceWinnings  → Pour retirer ou convertir en solde de jeu
```

**Règles strictes**:
- Acheter ticket: Déduire de `balanceGame`
- Gagner: Créditer `balanceWinnings`
- Conversion Gains → Jeu: Autorisée (taux 1:1)
- Conversion Jeu → Gains: **INTERDITE**
- Retrait: Uniquement depuis `balanceWinnings`

### 4. Transactions Atomiques

**CRITIQUE**: Toutes les opérations financières doivent être atomiques.

Exemple (crédit par revendeur):
```javascript
// Mauvaise approche
resellerTokenBalance -= amount;
playerBalanceGame += amount;
// ⚠️ Si crash ici, les données sont incohérentes !

// Bonne approche (transaction DB)
await db.transaction(async (session) => {
  await Reseller.updateOne(
    { _id: resellerId },
    { $inc: { tokenBalance: -amount } },
    { session }
  );
  
  await Player.updateOne(
    { _id: playerId },
    { $inc: { balanceGame: amount } },
    { session }
  );
  
  await Transaction.create([{
    type: 'RECHARGE',
    amount: amount,
    ...
  }], { session });
});
```

### 5. Validation des Numéros

**Format des numéros de téléphone**:
```
+228 + 8 chiffres = Togo
+229 + 8 chiffres = Bénin
+225 + 10 chiffres = Côte d'Ivoire
+233 + 9 chiffres = Ghana
+226 + 8 chiffres = Burkina Faso
```

**Numéros de loterie**:
- Pool: 1 à 90 (configurable par opérateur)
- Pas de doublons
- Pour ANAGRAMME: Uniquement 11-19, 21-29, 31-39, ..., 81-89

### 6. Multiplicateurs Dynamiques

Chaque **tirage** (Draw) a ses propres multiplicateurs définis par l'admin:

```javascript
draw.multipliers = {
  NAP1: 10,
  NAP2: 500,
  NAP3: 5000,
  NAP4: 25000,
  NAP5: 100000,
  PERMUTATION: 250,
  BANKA: 150,
  CHANCE_PLUS: 2000,
  ANAGRAMME: 10
}
```

⚠️ Ne PAS utiliser les multiplicateurs par défaut du BET_TYPES_CONFIG, mais ceux du tirage spécifique !

---

## 🗄️ CHOIX TECHNOLOGIQUES RECOMMANDÉS

### Stack Backend:
```
Serveur:        Node.js + Express (ou NestJS pour plus de structure)
Base de données: MongoDB (flexibilité) OU PostgreSQL (relations)
Authentification: JWT + bcrypt/argon2
ORM:            Mongoose (MongoDB) OU Prisma (PostgreSQL)
Validation:     Joi ou Zod
Testing:        Jest + Supertest
Documentation:  Swagger/OpenAPI
Monitoring:     Winston (logs) + Sentry (erreurs)
Cache:          Redis (optionnel pour sessions/stats)
Queue:          Bull (optionnel pour tâches async)
```

### Structure recommandée:
```
backend/
├── src/
│   ├── config/          # Configuration (DB, JWT, etc.)
│   ├── models/          # Modèles de données
│   ├── controllers/     # Logique des routes
│   ├── services/        # Business logic
│   ├── middlewares/     # Auth, validation, etc.
│   ├── routes/          # Définition des routes
│   ├── utils/           # Utilitaires
│   └── index.js         # Point d'entrée
├── tests/               # Tests
├── docs/                # Documentation
└── package.json
```

---

## 🔐 SÉCURITÉ

### Impératif:
- [ ] Hasher TOUS les mots de passe (bcrypt rounds >= 10)
- [ ] Valider TOUTES les entrées utilisateur
- [ ] Protéger contre les injections SQL/NoSQL
- [ ] Rate limiting sur tous les endpoints
- [ ] CORS configuré correctement
- [ ] HTTPS en production
- [ ] JWT avec expiration (15min access, 7j refresh)
- [ ] Protection CSRF
- [ ] Logs d'audit pour actions admin
- [ ] Backup automatique quotidien

### Permissions strictes:

| Action | Joueur | Revendeur | Admin |
|--------|--------|-----------|-------|
| Acheter ticket | ✅ | ❌ | ❌ |
| Créditer joueur | ❌ | ✅ | ✅ |
| Créer tirage | ❌ | ❌ | ✅ |
| Publier résultats | ❌ | ❌ | ✅ |
| Voir tous les utilisateurs | ❌ | ❌ | ✅ |
| Suspendre compte | ❌ | ❌ | ✅ |
| Traiter retrait | ❌ | ❌ | ✅ |

---

## 📊 ANALYTICS & MONITORING

### KPIs en temps réel (Dashboard Admin):

L'admin doit voir en temps réel:
- Chiffre d'affaires du jour
- Gains payés du jour
- Bénéfice brut
- Nouveaux joueurs
- Joueurs actifs
- Nombre de paris
- Revenus par opérateur
- **Combinaisons à risque** (très important pour limiter l'exposition)

### Combinaisons à Risque:

Si trop de joueurs parient sur la même combinaison, le risque financier est énorme.

Exemple:
- 100 joueurs parient 1000 F sur "12, 34" (NAP2, multiplicateur ×500)
- Si ces numéros sortent: **50,000,000 F de gains à payer !**

➡️ Le backend doit calculer et alerter sur les combinaisons critiques.

Seuils recommandés:
- **Low**: < 1M F de gain potentiel
- **Medium**: 1M - 5M F
- **High**: 5M - 10M F
- **Critical**: > 10M F (bloquer nouveaux paris ou réduire multiplicateur)

---

## 🌍 INTERNATIONALISATION

### Langue:
- Interface: **Français uniquement**
- Messages d'erreur: Français
- Emails: Français

### Devise:
- **Francs CFA** (XOF)
- Format: `10 000 F` (espace comme séparateur de milliers)

### Timezone:
- **UTC+0** (GMT - Afrique de l'Ouest)
- Toutes les dates en ISO 8601: `2025-10-29T14:30:00.000Z`

### Pays supportés:
- 🇹🇬 Togo
- 🇧🇯 Bénin
- 🇨🇮 Côte d'Ivoire
- 🇳🇬 Nigeria
- 🇸🇳 Sénégal

---

## 📞 COMMUNICATION FRONTEND ↔ BACKEND

### Format de communication:

**Requêtes:**
```http
POST /api/tickets
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "drawId": "draw_1730217600000_def456",
  "betType": "NAP2",
  "numbers": "12, 34",
  "betAmount": 1000
}
```

**Réponses succès:**
```json
{
  "success": true,
  "message": "Pari enregistré avec succès",
  "data": {
    "ticket": { ... },
    "newBalance": 4000
  }
}
```

**Réponses erreur:**
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

### Headers requis:

```
Authorization: Bearer {token}    // Pour toutes les routes protégées
Content-Type: application/json   // Pour tous les POST/PUT
```

---

## 🧪 TESTS REQUIS

### 1. Tests Unitaires
- [ ] Calcul des gains pour chaque type de pari
- [ ] Validation des numéros
- [ ] Validation des montants
- [ ] Hashage des mots de passe
- [ ] Génération des combinaisons PERMUTATION

### 2. Tests d'Intégration
- [ ] Flux complet inscription → achat ticket → gain
- [ ] Recharge par revendeur
- [ ] Conversion Gains → Jeu
- [ ] Demande et traitement de retrait
- [ ] Publication résultats → distribution gains

### 3. Tests de Sécurité
- [ ] Tentative d'accès sans authentification
- [ ] Tentative d'accès avec mauvais rôle
- [ ] Injection SQL/NoSQL
- [ ] XSS
- [ ] CSRF

### 4. Tests de Performance
- [ ] 1000 requêtes simultanées
- [ ] Calcul de gains pour 10000 tickets
- [ ] Temps de réponse < 200ms (endpoints standards)
- [ ] Temps de réponse < 2s (calcul gains complet)

---

## 🚀 DÉPLOIEMENT

### Environnements recommandés:

```
Development:  localhost:3000 (frontend) + localhost:5000 (backend)
Staging:      staging.lotohappy.com
Production:   api.lotohappy.com
```

### Variables d'environnement:

```env
# Base de données
DATABASE_URL=mongodb://localhost:27017/lotohappy
# ou
DATABASE_URL=postgresql://user:pass@localhost:5432/lotohappy

# JWT
JWT_SECRET=votre_secret_ultra_securise
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Migration
MIGRATION_SECRET_KEY=cle_secrete_pour_migration

# Emails (optionnel)
SENDGRID_API_KEY=xxx
EMAIL_FROM=noreply@lotohappy.com

# Google OAuth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Environnement
NODE_ENV=production
PORT=5000

# CORS
FRONTEND_URL=https://lotohappy.com

# Backup
BACKUP_SCHEDULE=0 2 * * * # Tous les jours à 2h du matin
```

---

## 📋 CHECKLIST AVANT LIVRAISON

### Backend:
- [ ] Tous les endpoints implémentés selon BACKEND_SPECIFICATIONS.md
- [ ] Calcul des gains validé pour les 9 types de paris
- [ ] Système de transactions atomiques en place
- [ ] Tests unitaires + intégration (coverage > 80%)
- [ ] Documentation API (Swagger)
- [ ] Logs structurés
- [ ] Monitoring des erreurs
- [ ] Rate limiting configuré
- [ ] CORS configuré
- [ ] SSL/HTTPS en production

### Migration:
- [ ] Endpoints de migration sécurisés
- [ ] Script de migration testé
- [ ] Backup des données localStorage
- [ ] Validation des données migrées
- [ ] Plan de rollback documenté

### Intégration:
- [ ] Frontend modifié pour utiliser l'API
- [ ] Tests E2E passants
- [ ] Performance optimale (< 200ms)
- [ ] Gestion des erreurs réseau
- [ ] Offline mode (optionnel)

---

## 🤝 POINTS DE SYNCHRONISATION

### Questions à discuter ensemble:

1. **Base de données**: MongoDB ou PostgreSQL ?
2. **Hébergement**: AWS, Google Cloud, DigitalOcean, autre ?
3. **Real-time**: WebSockets pour les notifications en temps réel ?
4. **Paiements**: Intégration Mobile Money (Fedapay, Stripe Africa) ?
5. **Emails**: SendGrid, Mailgun, ou autre ?
6. **Storage**: S3, Cloudinary pour les fichiers ?
7. **Cache**: Redis nécessaire ?
8. **Queue**: Bull/RabbitMQ pour les tâches asynchrones ?
9. **Monitoring**: Sentry, New Relic, ou autre ?
10. **CI/CD**: GitHub Actions, GitLab CI, ou autre ?

### Communication:

Pour toute question ou clarification:
1. Consulter d'abord les 4 documents de spec
2. Vérifier le code source frontend dans `/utils`
3. Demander des précisions si nécessaire

---

## 📖 RÉFÉRENCES RAPIDES

### Les 5 Opérateurs:

| ID | Nom | Pays | Couleur | Pool |
|----|-----|------|---------|------|
| togo-kadoo | Lotto Kadoo | Togo | #FFD700 | 1-90 |
| benin-lotto | Bénin Lotto | Bénin | #FF6B00 | 1-90 |
| ivoire-lonaci | Lonaci | Côte d'Ivoire | #4F00BC | 1-90 |
| nigeria-greenlotto | Green Lotto | Nigeria | #009DD9 | 1-90 |
| senegal-pmu | PMU Sénégal | Sénégal | #00A651 | 1-90 |

### Les 9 Types de Paris:

| Type | Nom | Min # | Max # | Multiplicateur |
|------|-----|-------|-------|----------------|
| NAP1 | Simple Numéro | 1 | 1 | ×10 |
| NAP2 | Deux Numéros | 2 | 2 | ×500 |
| NAP3 | Trois Numéros | 3 | 3 | ×5000 |
| NAP4 | Quatre Numéros | 4 | 4 | ×25000 |
| NAP5 | Cinq Numéros | 5 | 5 | ×100000 |
| PERMUTATION | Combinaisons Auto | 3 | 10 | ×250 |
| BANKA | Base + Autres | 2 | 6 | ×150 |
| CHANCE_PLUS | Position Exacte | 1 | 1 | ×2000 |
| ANAGRAMME | Numéros Inversés | 1 | 1 | ×10 |

### Opérateurs Mobile Money:

| Nom | Pays | ID |
|-----|------|-----|
| TMoney | Togo | tmoney |
| Flooz | Togo, Bénin | flooz |
| MTN Mobile Money | Multi-pays | mtn |
| Orange Money | Côte d'Ivoire, Sénégal | orange |
| Wave | Sénégal, Côte d'Ivoire | wave |
| Moov Money | Multi-pays | moov |

---

## 🎯 PRIORITÉS

### Priorité 1 (Critique):
- Authentification (JWT)
- CRUD Draws
- CRUD Tickets
- Calcul des gains
- Distribution automatique

### Priorité 2 (Important):
- Système de revendeurs
- Demandes de retrait
- Dashboard admin
- Combinaisons à risque

### Priorité 3 (Nice to have):
- Notifications en temps réel (WebSockets)
- Intégration Mobile Money
- Envoi d'emails
- Système de cache

---

## 💡 DERNIERS CONSEILS

1. **Commencer simple**: Implémenter d'abord NAP2, puis étendre aux autres types
2. **Tester constamment**: Chaque fonction de calcul doit avoir des tests
3. **Documenter**: Commenter le code, surtout les logiques complexes
4. **Communiquer**: Poser des questions si quelque chose n'est pas clair
5. **Sécurité first**: Ne jamais faire confiance aux données du frontend
6. **Performance**: Optimiser les requêtes DB (indexes, pagination)
7. **Logs**: Logger toutes les actions financières pour audit
8. **Backup**: Automatiser les backups dès le départ

---

## ✅ VALIDATION FINALE

Avant de dire "c'est prêt", vérifier:

1. [ ] Tous les endpoints de BACKEND_SPECIFICATIONS.md sont implémentés
2. [ ] Tous les exemples de API_EXAMPLES.md fonctionnent
3. [ ] La migration DATA_MIGRATION_GUIDE.md s'exécute sans erreur
4. [ ] Le calcul des gains est validé pour les 9 types de paris
5. [ ] Les soldes sont toujours cohérents (pas de création d'argent)
6. [ ] Les permissions sont strictement appliquées
7. [ ] Les erreurs sont gérées proprement
8. [ ] La documentation API est à jour
9. [ ] Les tests passent (> 80% coverage)
10. [ ] L'application est déployée et accessible

---

## 🎉 CONCLUSION

Vous avez toutes les informations nécessaires pour développer un backend robuste et production-ready pour Loto Happy. 

**Documents à consulter dans l'ordre:**
1. Ce fichier (BACKEND_HANDOFF.md) pour la vue d'ensemble
2. BACKEND_SPECIFICATIONS.md pour les détails techniques
3. API_EXAMPLES.md pour les exemples concrets
4. DATA_MIGRATION_GUIDE.md pour la migration
5. Code source frontend dans `/utils` pour comprendre la logique actuelle

**N'oubliez pas:**
- La sécurité est primordiale (argent réel en jeu)
- Les transactions doivent être atomiques
- Le calcul des gains doit être exact à 100%
- Tester, tester, tester !

Bon développement ! 🚀

---

**Questions / Support:**
Référez-vous aux documents de spec ou consultez le code source frontend.

**Version:** 1.0  
**Date:** 29 Octobre 2025  
**Statut:** Prêt pour développement backend
