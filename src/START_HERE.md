# 🚀 COMMENCEZ ICI - Backend Loto Happy

**Bienvenue !** Vous êtes l'IA chargée de développer le backend de Loto Happy.

---

## 📁 DOCUMENTATION FOURNIE (4 fichiers)

### 🎯 1. **START_HERE.md** ← Vous êtes ici
   - Vue d'ensemble du projet
   - Ordre de lecture des documents
   - Quick start guide

### 🤝 2. **BACKEND_HANDOFF.md** (33 pages)
   - **LIRE EN PREMIER**
   - Résumé exécutif du projet
   - Points critiques à ne pas manquer
   - Checklist complète
   - Priorités de développement

### 📋 3. **BACKEND_SPECIFICATIONS.md** (98 pages)
   - **RÉFÉRENCE PRINCIPALE**
   - Toutes les interfaces TypeScript
   - 60+ endpoints API détaillés
   - Logiques métier complètes
   - Règles de validation
   - Calcul des gains pour 9 types de paris

### 📡 4. **API_EXAMPLES.md** (55 pages)
   - **GUIDE D'IMPLÉMENTATION**
   - Exemples requête/réponse pour chaque endpoint
   - Cas d'usage concrets
   - Gestion d'erreurs
   - Données de test

### 🔄 5. **DATA_MIGRATION_GUIDE.md** (42 pages)
   - **GUIDE DE MIGRATION**
   - Structure des données localStorage actuelles
   - Scripts de transformation
   - Plan de basculement
   - Validation post-migration

---

## 🎓 ORDRE DE LECTURE RECOMMANDÉ

### Première lecture (1-2h):
1. ✅ **START_HERE.md** (ce fichier) - 5 min
2. ✅ **BACKEND_HANDOFF.md** - 30 min
   - Comprendre le projet dans son ensemble
   - Identifier les points critiques
   - Noter les questions à poser

### Avant de coder:
3. 📋 **BACKEND_SPECIFICATIONS.md** - 1h
   - Lire toutes les interfaces
   - Comprendre les logiques métier
   - Noter les endpoints prioritaires

4. 📡 **API_EXAMPLES.md** - 30 min
   - Voir les formats de requête/réponse
   - Comprendre les cas d'usage
   - Identifier les patterns

### Pendant le développement:
- **BACKEND_SPECIFICATIONS.md** comme référence constante
- **API_EXAMPLES.md** pour chaque endpoint implémenté
- **DATA_MIGRATION_GUIDE.md** quand prêt à migrer

---

## ⚡ QUICK START (30 minutes)

### Étape 1: Comprendre l'application (10 min)

**Loto Happy c'est:**
- 🎰 Agrégateur de **5 loteries** ouest-africaines
- 🎯 **9 types de paris** avancés (NAP1-5, PERMUTATION, BANKA, etc.)
- 👥 **3 rôles**: Joueur, Revendeur, Admin
- 💰 **Double solde**: Jeu + Gains
- 🌍 Pays: Togo, Bénin, Côte d'Ivoire, Nigeria, Sénégal

**État actuel:**
- ✅ Frontend 100% fonctionnel
- ⏳ Données en localStorage (à migrer vers backend)

**Votre mission:**
- Créer l'API backend complète
- Migrer les données existantes
- Intégrer avec le frontend

### Étape 2: Identifier les entités clés (10 min)

**6 entités principales:**

1. **User** (Joueur/Revendeur/Admin)
   - Authentification (Email/Password + Google OAuth)
   - Soldes (balanceGame, balanceWinnings, tokenBalance)
   - Transactions

2. **Draw** (Tirage)
   - Créé par admin
   - Lié à un opérateur
   - Multiplicateurs configurables
   - Statut: upcoming → pending → completed

3. **Ticket** (Pari)
   - Acheté par joueur
   - Lié à un tirage
   - 9 types possibles (NAP1-5, PERMUTATION, BANKA, CHANCE+, ANAGRAMME)
   - Statut: pending → won/lost

4. **WithdrawalRequest** (Retrait)
   - Demandé par joueur
   - Traité par admin
   - Statut: pending → approved/rejected

5. **WinNotification** (Notification de gain)
   - Créée automatiquement quand joueur gagne
   - Affichée dans l'interface joueur

6. **Transaction** (Historique)
   - Toutes les opérations financières
   - Types: RECHARGE, BET, WIN, CONVERSION, WITHDRAWAL

### Étape 3: Comprendre le flow principal (10 min)

**Flow complet d'un pari:**

```
1. JOUEUR s'inscrit
   └─> POST /auth/register → Crée User

2. REVENDEUR crédite le compte joueur
   └─> POST /resellers/:id/credit-player
       ├─> Déduit tokenBalance revendeur
       ├─> Crédite balanceGame joueur
       └─> Crée transaction RECHARGE

3. JOUEUR achète un ticket
   └─> POST /tickets
       ├─> Vérifie balanceGame >= betAmount
       ├─> Déduit balanceGame
       ├─> Crée ticket status='pending'
       └─> Crée transaction BET

4. ADMIN crée un tirage
   └─> POST /draws → Crée Draw status='upcoming'

5. [Heure du tirage passe]
   └─> Système: Draw status → 'pending'

6. ADMIN publie les résultats
   └─> PUT /draws/:id/results
       ├─> Met winningNumbers
       ├─> Draw status → 'completed'
       └─> CALCULE ET DISTRIBUE LES GAINS:
           ├─> Pour chaque ticket:
           │   ├─> Si gagnant:
           │   │   ├─> Crédite balanceWinnings
           │   │   ├─> Crée transaction WIN
           │   │   ├─> Crée WinNotification
           │   │   └─> Ticket status → 'won'
           │   └─> Sinon:
           │       └─> Ticket status → 'lost'
           └─> Fin

7. JOUEUR voit sa notification de gain
   └─> GET /notifications/user/:userId

8. JOUEUR demande un retrait
   └─> POST /withdrawals
       ├─> Déduit immédiatement balanceWinnings
       ├─> Crée WithdrawalRequest status='pending'
       └─> Crée transaction WITHDRAWAL

9. ADMIN approuve le retrait
   └─> PUT /withdrawals/:id/approve
       └─> WithdrawalRequest status → 'approved'
```

---

## 🎯 PRIORITÉS DE DÉVELOPPEMENT

### Phase 1: MVP (Semaine 1-2) ⭐⭐⭐

**Objectif**: API fonctionnelle pour le flow de base

- [ ] Setup projet (Express/NestJS + MongoDB/PostgreSQL)
- [ ] Authentification JWT
- [ ] POST /auth/register
- [ ] POST /auth/login
- [ ] GET /auth/me
- [ ] CRUD /draws (admin)
- [ ] POST /tickets (joueur)
- [ ] GET /tickets/user/:userId
- [ ] Calcul gain NAP2 (le plus simple)
- [ ] Tests unitaires calcul gain

**Livrable**: Un joueur peut s'inscrire, acheter un ticket NAP2, et gagner.

### Phase 2: Types de Paris (Semaine 3) ⭐⭐

**Objectif**: Implémenter tous les types de paris

- [ ] Calcul gain NAP1, NAP3, NAP4, NAP5
- [ ] Calcul gain PERMUTATION
- [ ] Calcul gain BANKA
- [ ] Calcul gain CHANCE_PLUS
- [ ] Calcul gain ANAGRAMME
- [ ] Tests pour chaque type
- [ ] PUT /draws/:id/results (distribution automatique)

**Livrable**: Tous les types de paris fonctionnent.

### Phase 3: Système Complet (Semaine 4) ⭐⭐

**Objectif**: Features complètes

- [ ] Système de revendeurs
- [ ] POST /resellers/:id/credit-player
- [ ] POST /players/:id/convert (Gains → Jeu)
- [ ] POST /withdrawals
- [ ] PUT /withdrawals/:id/approve
- [ ] PUT /withdrawals/:id/reject
- [ ] GET /admin/stats/* (dashboard)
- [ ] Notifications de gains

**Livrable**: Application complète fonctionnelle.

### Phase 4: Migration & Intégration (Semaine 5-6) ⭐

**Objectif**: Mettre en production

- [ ] Endpoints de migration sécurisés
- [ ] Migration des données localStorage
- [ ] Intégration frontend ↔ backend
- [ ] Tests E2E
- [ ] Documentation API (Swagger)
- [ ] Déploiement

**Livrable**: Application en production.

---

## 🔥 POINTS ULTRA-CRITIQUES

### 1. Calcul des Gains ⚠️⚠️⚠️

**LE PLUS IMPORTANT DE TOUTE L'APPLICATION**

- Argent réel en jeu
- Doit être exact à 100%
- Tests obligatoires pour chaque type

👉 Voir **BACKEND_SPECIFICATIONS.md** section "CALCUL DES GAINS"

### 2. Transactions Atomiques ⚠️⚠️

**Toutes les opérations financières doivent être atomiques**

Exemple: Crédit par revendeur
```javascript
// ❌ MAUVAIS
resellerBalance -= 5000;
playerBalance += 5000; // ⚠️ Si crash ici, argent perdu !

// ✅ BON
await db.transaction(async (session) => {
  await updateReseller(..., { session });
  await updatePlayer(..., { session });
  await createTransaction(..., { session });
});
```

### 3. Double Solde ⚠️

**Les joueurs ont 2 soldes séparés:**
- `balanceGame` → Pour jouer
- `balanceWinnings` → Pour retirer

**Règles:**
- ✅ Gains → Jeu (conversion autorisée)
- ❌ Jeu → Gains (INTERDIT)
- ✅ Retrait depuis Gains uniquement

### 4. Sécurité ⚠️

- 🔒 Hasher TOUS les mots de passe (bcrypt >= 10 rounds)
- 🔒 Valider TOUTES les entrées
- 🔒 JWT avec expiration courte (15min)
- 🔒 Rate limiting sur tous les endpoints
- 🔒 CORS configuré strictement
- 🔒 HTTPS en production obligatoire

---

## 🧪 TESTS CRITIQUES

**Avant de dire "c'est prêt", ces tests DOIVENT passer:**

### Tests de Calcul de Gains:

```javascript
describe('Calcul NAP2', () => {
  test('Doit gagner si les 2 numéros sont tirés', () => {
    const result = checkNAP2Win(
      [12, 34],           // Numéros joueur
      [12, 34, 56, 78, 90], // Numéros gagnants
      1000,               // Mise
      500                 // Multiplicateur
    );
    expect(result).toBe(500000); // 1000 × 500
  });

  test('Ne doit pas gagner si un seul numéro est tiré', () => {
    const result = checkNAP2Win(
      [12, 99],
      [12, 34, 56, 78, 90],
      1000,
      500
    );
    expect(result).toBe(0);
  });
});

// Idem pour NAP1, NAP3, NAP4, NAP5, PERMUTATION, BANKA, CHANCE_PLUS, ANAGRAMME
```

### Tests de Transactions:

```javascript
describe('Achat de ticket', () => {
  test('Doit déduire le montant du solde', async () => {
    const initialBalance = 5000;
    await buyTicket(userId, drawId, 1000);
    const newBalance = await getPlayerBalance(userId);
    expect(newBalance).toBe(4000);
  });

  test('Doit refuser si solde insuffisant', async () => {
    const balance = 500;
    await expect(
      buyTicket(userId, drawId, 1000)
    ).rejects.toThrow('INSUFFICIENT_BALANCE');
  });
});
```

---

## 📞 QUESTIONS FRÉQUENTES

### Q: Quelle base de données utiliser ?
**R**: MongoDB ou PostgreSQL. MongoDB si vous préférez la flexibilité, PostgreSQL si vous préférez les relations strictes.

### Q: Comment gérer les multiplicateurs ?
**R**: Chaque Draw a ses propres multiplicateurs. Ne PAS utiliser les valeurs par défaut, mais celles du tirage spécifique.

### Q: Comment calculer les gains PERMUTATION ?
**R**: Générer toutes les combinaisons de 2 numéros, puis pour chaque combinaison, vérifier si TOUS ses numéros sont dans les gagnants. Gain = (mise / nb_combinaisons) × multiplicateur par combinaison gagnante.

### Q: Quand distribuer les gains ?
**R**: Automatiquement quand l'admin publie les résultats (PUT /draws/:id/results). Le backend doit parcourir tous les tickets du tirage et calculer les gains.

### Q: Comment gérer les retraits rejetés ?
**R**: Si rejet, RE-CRÉDITER le balanceWinnings du joueur (l'argent avait été déduit lors de la demande).

### Q: Faut-il un système de cache ?
**R**: Optionnel pour la v1. Redis peut être ajouté plus tard pour les stats en temps réel.

---

## 🛠️ SETUP RAPIDE (Exemple Node.js + MongoDB)

```bash
# 1. Créer le projet
mkdir loto-happy-backend
cd loto-happy-backend
npm init -y

# 2. Installer les dépendances
npm install express mongoose jsonwebtoken bcrypt cors dotenv
npm install --save-dev nodemon jest supertest

# 3. Structure de base
mkdir -p src/{config,models,controllers,services,middlewares,routes,utils}
touch src/index.js
touch .env

# 4. .env
echo "DATABASE_URL=mongodb://localhost:27017/lotohappy" >> .env
echo "JWT_SECRET=votre_secret_ultra_securise" >> .env
echo "PORT=5000" >> .env

# 5. Lancer
npm run dev
```

---

## ✅ CHECKLIST DE DÉMARRAGE

Avant de commencer à coder:

- [ ] J'ai lu **BACKEND_HANDOFF.md** entièrement
- [ ] J'ai parcouru **BACKEND_SPECIFICATIONS.md**
- [ ] Je comprends le flow principal
- [ ] Je connais les 6 entités principales
- [ ] J'ai identifié les points critiques (calcul gains, transactions atomiques)
- [ ] J'ai choisi ma stack technique (Node.js/Python/Java + DB)
- [ ] J'ai un environnement de dev configuré
- [ ] J'ai accès aux 4 documents de spec
- [ ] Je sais où trouver l'aide (documents + code frontend)

---

## 🎉 C'EST PARTI !

Vous êtes prêt ! Voici votre roadmap:

1. **Aujourd'hui**: Lire BACKEND_HANDOFF.md + BACKEND_SPECIFICATIONS.md
2. **Demain**: Setup projet + Authentification
3. **Cette semaine**: MVP (Flow de base avec NAP2)
4. **Prochaines semaines**: Compléter tous les types de paris
5. **Ensuite**: Migration + Intégration + Production

**N'oubliez pas:**
- 🧪 Tester constamment
- 📖 Consulter les specs régulièrement  
- 🔒 Sécurité d'abord
- 💬 Poser des questions si besoin

**Bon développement ! 🚀**

---

**Documents à consulter:**
1. ✅ **START_HERE.md** (ce fichier)
2. 🤝 **BACKEND_HANDOFF.md** - Vue d'ensemble et points critiques
3. 📋 **BACKEND_SPECIFICATIONS.md** - Référence technique complète
4. 📡 **API_EXAMPLES.md** - Exemples d'implémentation
5. 🔄 **DATA_MIGRATION_GUIDE.md** - Guide de migration

**Code source frontend:**
- `/utils/auth.ts` - Système d'authentification
- `/utils/games.ts` - Configuration opérateurs et paris
- `/utils/draws.ts` - Gestion tirages et calcul gains
- `/components/admin/` - Interface admin

---

**Version:** 1.0  
**Date:** 29 Octobre 2025  
**Statut:** 🚀 Prêt pour développement
