# ✅ Guide de Test: Auto-Masquage des Jeux Expirés

## 🎯 Objectif
Vérifier que les tirages expirés (date/heure passées) disparaissent automatiquement de la vue joueur sans clignotement.

---

## 📋 Scénario 1: Jeu qui expire dans 2 minutes

### Étapes:
1. **Se connecter en tant qu'admin**
   - Email: `admin@lotohappy.com`
   - Password: `admin123`

2. **Aller dans "Gestion des Jeux"**

3. **Créer un nouveau tirage**
   - Sélectionner: Loto Kadoo 5naps
   - Date: Aujourd'hui (27 octobre 2025)
   - Heure: **Dans 2 minutes** (ex: si il est 14:30, mettre 14:32)
   - Cliquer "Créer le Tirage"

4. **Se déconnecter et se reconnecter en tant que joueur**
   - Username: `player1` / Password: `password123`
   - OU créer un nouveau compte

5. **Observer le dashboard**
   - ✅ Le jeu Loto Kadoo 5naps doit apparaître
   - ✅ Le compte à rebours doit afficher "Dans 2min" (ou moins)
   - ✅ La date doit être "lundi 27 octobre"

6. **Attendre que le compte à rebours atteigne 00:00:00**
   - ⏰ Observer pendant environ 2 minutes

7. **Vérifier le comportement**
   - ✅ Le jeu doit **disparaître automatiquement** de la liste
   - ✅ **AUCUN clignotement** (pas de jeu de lumière)
   - ✅ Transition fluide et propre
   - ✅ Si c'était le seul jeu, message "Aucun tirage disponible"

---

## 📋 Scénario 2: Plusieurs jeux, un qui expire

### Étapes:
1. **En tant qu'admin, créer 3 tirages:**
   - Loto Kadoo 5naps: Aujourd'hui dans **1 minute**
   - Bénin Loto 5naps: Demain à 18:00
   - Mali Loto 3naps: Après-demain à 14:00

2. **Se connecter en tant que joueur**

3. **Observer le dashboard**
   - ✅ Les 3 jeux doivent être visibles
   - ✅ Loto Kadoo doit afficher "Dans 1min"

4. **Attendre 1 minute**
   - ✅ Loto Kadoo doit **disparaître automatiquement**
   - ✅ Les 2 autres jeux restent visibles
   - ✅ Aucun clignotement
   - ✅ Le featured draw se met à jour vers Bénin Loto ou Mali Loto

---

## 📋 Scénario 3: Essayer d'accéder à un jeu expiré

### Étapes:
1. **Créer un tirage qui expire dans 30 secondes**

2. **En tant que joueur, cliquer sur le jeu**
   - ✅ L'écran de jeu s'ouvre normalement
   - ✅ Les infos du tirage s'affichent correctement

3. **Attendre que le tirage expire (30 secondes)**

4. **Rafraîchir la page ou revenir au dashboard puis re-cliquer sur le jeu**
   - ✅ Message affiché: "Aucun tirage disponible"
   - ✅ Texte: "Il n'y a actuellement aucun tirage programmé pour [Nom du jeu]"
   - ✅ Bouton "Retour aux jeux" visible
   - ✅ Pas de grille de sélection de numéros (masquée)

---

## 📋 Scénario 4: Cohérence des dates (Carte vs Écran de jeu)

### Étapes:
1. **Créer 2 tirages pour le MÊME jeu:**
   - Loto Kadoo 5naps: **Aujourd'hui à 16:44**
   - Loto Kadoo 5naps: **Demain à 18:00**

2. **Observer le dashboard en tant que joueur**
   - ✅ UNE SEULE carte Loto Kadoo doit être visible
   - ✅ Elle doit afficher le PREMIER tirage (aujourd'hui 16:44)

3. **Cliquer sur la carte Loto Kadoo**
   - ✅ L'écran de jeu doit afficher **EXACTEMENT la même date/heure**
   - ✅ "lundi 27 octobre" + "16:44"
   - ✅ Pas de surprise, pas de date différente

4. **Attendre que le premier tirage (16:44) expire**
   - ✅ La carte doit se mettre à jour et afficher le DEUXIÈME tirage
   - ✅ Nouvelle date affichée: "mardi 28 octobre à 18:00"

---

## 📋 Scénario 5: Nettoyage automatique (1 minute)

### Étapes:
1. **Créer un tirage qui expire dans 30 secondes**

2. **Laisser la page du dashboard ouverte**
   - Ne pas rafraîchir
   - Ne pas naviguer

3. **Attendre 1 minute**
   - ✅ À 00:00:00, le jeu devrait commencer à se préparer à disparaître
   - ✅ Après ~30 secondes supplémentaires (au prochain cycle de 1 minute), le jeu disparaît
   - ✅ Aucun clignotement pendant tout ce temps

---

## ❌ Comportements à NE PAS observer

### Clignotement "Jeu de Lumière" ⚠️
- ❌ Le jeu ne doit JAMAIS clignoter rapidement
- ❌ Pas de flash blanc/noir répété
- ❌ Pas d'affichage/disparition en boucle

### Erreurs Console ⚠️
- ❌ Pas d'erreurs dans la console du navigateur (F12)
- ❌ Pas de warnings liés aux tirages

### Dates Incohérentes ⚠️
- ❌ La carte ne doit JAMAIS afficher une date différente de l'écran de jeu
- ❌ Si la carte dit "27 octobre", l'écran de jeu doit dire "27 octobre"

---

## ✅ Résultats Attendus

### Pour l'utilisateur:
1. **Expérience fluide**: Les jeux expirés disparaissent sans perturbation visuelle
2. **Clarté**: Messages informatifs si aucun tirage disponible
3. **Cohérence**: Les dates affichées sont toujours exactes et cohérentes
4. **Fiabilité**: Impossible de parier sur un tirage expiré

### Pour le système:
1. **Auto-nettoyage**: Les tirages expirés sont automatiquement filtrés
2. **Performance**: Pas de rerenders inutiles ou en boucle
3. **Stabilité**: Aucun crash ou comportement erratique
4. **Synchronisation**: Les vues (Dashboard, GameScreen) sont toujours synchronisées

---

## 🐛 Si vous observez des problèmes

### Problème: Le jeu clignote toujours
**Vérifier:**
- Ouvrir la console (F12)
- Chercher des erreurs ou warnings
- Vérifier que `getValidDraws()` est bien appelée
- Vérifier que le flag `hasExpired` fonctionne

### Problème: Dates incohérentes
**Vérifier:**
- Les cartes utilisent bien `draw.date` et `draw.time` directement
- Pas d'utilisation de `formatNextDraw()` ou `getGameDrawInfo()`
- Chaque carte affiche le tirage spécifique, pas un tirage calculé

### Problème: Le jeu ne disparaît pas
**Vérifier:**
- Le filtre `drawDateTime.getTime() > now.getTime()` est bien appliqué
- Le nettoyage automatique (60 secondes) fonctionne
- Les statuts des tirages sont mis à jour (`updateDrawStatuses()`)

---

## 📝 Notes

- Le nettoyage automatique se fait **toutes les minutes** (60000ms)
- Le compte à rebours du featured draw est mis à jour **toutes les secondes**
- Un délai de **500ms** est appliqué avant de mettre à jour le featured draw après expiration
- Les tirages avec `status = 'archived'` ne sont JAMAIS affichés aux joueurs
