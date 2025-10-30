# 🔧 CORRECTIONS EN COURS

## ✅ CE QUI A ÉTÉ FAIT

### 1. Système de Configuration des Jeux (`/utils/games.ts`) ✅
- ✅ Configuration complète de 15 jeux (5 pays × 3 types)
- ✅ Togo: Loto Kadoo (2naps, 3naps, 5naps)
- ✅ Bénin: Bénin Loto (2naps, 3naps, 5naps)
- ✅ Côte d'Ivoire: Ivoire Jackpot (2naps, 3naps, 5naps)
- ✅ Ghana: Ghana Lucky (2naps, 3naps, 5naps)
- ✅ Burkina Faso: Burkina Win (2naps, 3naps, 5naps)
- ✅ Fonctions utilitaires (getGameById, getGamesByCountry, formatNextDraw, etc.)

### 2. Système de Tirages Refait (`/utils/draws.ts`) ✅
- ✅ Interface Draw mise à jour avec gameId, type, country
- ✅ Interface Ticket complète avec tous les champs
- ✅ Interface BetHistoryItem pour l'historique détaillé
- ✅ Fonction createTicket() pour enregistrer les paris
- ✅ Fonction getBetHistory() pour l'historique d'un joueur
- ✅ Fonction updateDrawStatuses() pour upcoming → pending
- ✅ Fonction submitDrawResults() pour distribuer les gains
- ✅ Mise à jour du nombre de participants automatique

### 3. GameScreen Refait (`/components/GameScreen.tsx`) ✅
- ✅ Utilise le nouveau système de jeux (games.ts)
- ✅ Affiche les infos du prochain tirage (date, heure, countdown)
- ✅ Enregistre le pari dans localStorage via createTicket()
- ✅ Met à jour l'historique des transactions
- ✅ Couleurs dynamiques selon le jeu
- ✅ Grid adaptatif selon le type (2/3/5 numéros, max 50 ou 90)

---

## 🔄 CE QUI RESTE À FAIRE

### 4. Dashboard - Affichage des Jeux par Pays 🔄
**Fichier:** `/components/Dashboard.tsx`

**Objectif:**
- Afficher les jeux groupés par pays
- Montrer la date et l'heure du prochain tirage pour chaque jeu
- Utiliser les couleurs et icônes de games.ts

**Changes nécessaires:**
```typescript
import { GAMES_CONFIG, formatNextDraw } from '../utils/games';

// Dans le composant:
const userCountryCode = getCurrentUser()?.phoneNumber.startsWith('228') ? '+228' : '+229'; // etc.
const userGames = getGamesByCountry(userCountryCode);

// Pour chaque jeu:
{userGames.map(game => {
  const nextDraw = formatNextDraw(game);
  return (
    <GameCard
      key={game.id}
      game={game}
      nextDrawDate={nextDraw.date}
      nextDrawTime={nextDraw.time}
      countdown={nextDraw.countdown}
      onClick={() => onNavigateToGame(game.id)}
    />
  );
})}
```

### 5. Composant BetHistory - Historique Détaillé 🔄
**Fichier:** `/components/BetHistory.tsx` (À CRÉER)

**Objectif:**
- Afficher l'historique des paris avec tous les détails
- Numéros joués
- Montant misé
- Date et heure du tirage
- Statut (à venir, en attente, gagné, perdu)
- Numéros gagnants si tirage archivé
- Montant gagné si gagnant

**Structure:**
```typescript
import { getBetHistory } from '../utils/draws';

export function BetHistory({ userId }: { userId: string }) {
  const bets = getBetHistory(userId);
  
  return (
    <div>
      {bets.map(bet => (
        <Card key={bet.id}>
          <h3>{bet.gameName}</h3>
          <p>Vos numéros: {bet.numbers}</p>
          <p>Mise: {bet.betAmount} F</p>
          <p>Tirage: {bet.drawDate} à {bet.drawTime}</p>
          <Badge status={bet.status} />
          {bet.winningNumbers && <p>Numéros gagnants: {bet.winningNumbers}</p>}
          {bet.winAmount && <p>Gain: {bet.winAmount} F</p>}
        </Card>
      ))}
    </div>
  );
}
```

### 6. ProfileScreen - Intégration BetHistory 🔄
**Fichier:** `/components/ProfileScreen.tsx`

**Objectif:**
- Ajouter un onglet "Historique des Paris"
- Utiliser le composant BetHistory

### 7. AdminGames - Adaptation au Nouveau Système 🔄
**Fichier:** `/components/admin/AdminGames.tsx`

**Objectif:**
- Utiliser GAMES_CONFIG pour la sélection du jeu
- Afficher le pays et le type dans les listes
- Adapter les modals de création
- S'assurer que les tirages pending s'affichent correctement

**Changes nécessaires:**
```typescript
import { GAMES_CONFIG } from '../utils/games';

// Dans le modal de création:
<Select value={newDrawGame} onValueChange={setNewDrawGame}>
  {GAMES_CONFIG.map(game => (
    <SelectItem key={game.id} value={game.id}>
      {game.country} - {game.name}
    </SelectItem>
  ))}
</Select>
```

### 8. AdminFinance - Vrais Données 🔄
**Fichier:** `/components/admin/AdminFinance.tsx`

**Objectif:**
- Afficher les vrais tickets au lieu de données fictives
- Utiliser getTickets() et getDraws()
- Calculer les vraies statistiques

**Changes nécessaires:**
```typescript
import { getTickets, getDraws } from '../utils/draws';

const tickets = getTickets();
const draws = getDraws();

// Calculer les stats réelles
const totalBets = tickets.reduce((sum, t) => sum + t.betAmount, 0);
const archivedDraws = draws.filter(d => d.status === 'archived');
const totalWinnings = archivedDraws.reduce((sum, d) => sum + (d.totalWinnings || 0), 0);
```

### 9. WinNotification - Adaptation Couleurs 🔄
**Fichier:** `/components/WinNotification.tsx`

**Objectif:**
- Utiliser les couleurs du jeu (depuis games.ts)
- Adapter le trophée selon 2naps/3naps/5naps

### 10. GameCard - Affichage Amélioré 🔄
**Fichier:** `/components/GameCard.tsx`

**Objectif:**
- Afficher la date et l'heure du prochain tirage
- Utiliser les couleurs de games.ts
- Afficher le type (2naps, 3naps, 5naps)

---

## 🎯 PRIORITÉS

### Priorité 1 (CRITIQUE)
1. ✅ Dashboard - Afficher les jeux du pays de l'utilisateur
2. ✅ AdminGames - Adapter au nouveau système
3. ✅ Créer un tirage et vérifier qu'il passe en "pending"

### Priorité 2 (IMPORTANT)
4. ✅ BetHistory - Créer le composant d'historique détaillé
5. ✅ ProfileScreen - Intégrer l'historique des paris
6. ✅ AdminFinance - Afficher les vrais paris

### Priorité 3 (AMÉLIORATION)
7. ✅ WinNotification - Couleurs dynamiques
8. ✅ GameCard - Affichage amélioré
9. ✅ Tester le workflow complet

---

## 🧪 WORKFLOW DE TEST

### Test 1 : Placer un Pari
1. Connexion joueur
2. Dashboard → Clic sur un jeu (ex: Loto Kadoo 5naps)
3. Sélectionner 5 numéros
4. Valider le pari
5. **VÉRIFIER:**
   - ✅ Toast "Pari enregistré !"
   - ✅ Solde diminué
   - ✅ Transaction dans l'historique
   - ✅ localStorage `loto_happy_tickets` contient le ticket

### Test 2 : Voir l'Historique
1. Profil → Historique des Paris
2. **VÉRIFIER:**
   - ✅ Le pari apparaît
   - ✅ Numéros affichés
   - ✅ Montant misé
   - ✅ Date du tirage
   - ✅ Statut "À venir" ou "En attente"

### Test 3 : Admin Saisir Résultats
1. Connexion admin
2. Gestion des Jeux → Saisir Résultats
3. Saisir les numéros gagnants
4. **VÉRIFIER:**
   - ✅ Le joueur reçoit le gain si numéros corrects
   - ✅ Le ticket passe à "gagné" ou "perdu"
   - ✅ L'historique du joueur est mis à jour
   - ✅ Notification de gain créée

### Test 4 : Admin Finance
1. Admin → Gestion Financière → Historique Global
2. **VÉRIFIER:**
   - ✅ Les vrais paris apparaissent
   - ✅ Les vrais montants
   - ✅ Les vrais noms de joueurs

---

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### Créés ✅
- `/utils/games.ts` - Configuration des jeux
- `/CORRECTIONS_EN_COURS.md` - Ce fichier

### Modifiés ✅
- `/utils/draws.ts` - Système complet de tirages et paris
- `/components/GameScreen.tsx` - Enregistrement des paris

### À Créer 🔄
- `/components/BetHistory.tsx` - Historique détaillé des paris

### À Modifier 🔄
- `/components/Dashboard.tsx` - Affichage des jeux par pays
- `/components/GameCard.tsx` - Infos de tirage
- `/components/ProfileScreen.tsx` - Intégration historique
- `/components/admin/AdminGames.tsx` - Nouveau système
- `/components/admin/AdminFinance.tsx` - Vrais données
- `/components/WinNotification.tsx` - Couleurs dynamiques

---

## 🎉 PROCHAINES ÉTAPES

Je vais maintenant :
1. Mettre à jour Dashboard.tsx pour afficher les jeux par pays
2. Créer BetHistory.tsx pour l'historique détaillé
3. Mettre à jour AdminGames.tsx pour le nouveau système
4. Mettre à jour AdminFinance.tsx pour les vrais données
5. Tester le workflow complet

**Temps estimé:** 30-45 minutes

**Voulez-vous que je continue ?**
