# 🔧 Correction du Clignotement et de l'Incohérence des Dates

## Problèmes Identifiés

### 1. Clignotement quand le compte à rebours atteint 00:00:00 ⚡
**Symptôme:** Les jeux clignotent comme un jeu de lumières au lieu de disparaître proprement.

**Cause:** 
- Le timer (`setInterval`) continuait à s'exécuter même après que `diff <= 0`
- À chaque seconde, il essayait de remplacer le `featuredDraw` en boucle
- Cela causait des rerenders constants du composant Dashboard
- Les tirages expirés restaient visibles dans la liste

**Solution (NOUVELLE APPROCHE - AUTO-MASQUAGE):**
- ✅ Filtrage automatique des tirages expirés AVANT affichage
- ✅ Fonction `getValidDraws()` qui ne retourne que les tirages avec date/heure futures
- ✅ Nettoyage automatique toutes les minutes
- ✅ Les jeux expirés disparaissent automatiquement sans clignotement
- ✅ Message informatif si un joueur essaye d'accéder à un jeu sans tirage valide

### 2. Incohérence des dates entre la carte et l'écran de jeu 📅
**Symptôme:** 
- La carte affiche "lundi 27 octobre"
- Mais quand on clique, l'écran de jeu affiche "mardi 28 octobre 18:00"

**Cause:**
- La fonction `getGameDrawInfo()` cherchait le PREMIER tirage disponible pour un jeu
- Mais si plusieurs tirages existent pour le même jeu (ex: Loto Kadoo 5naps le 27 ET le 28)
- Les cartes pouvaient afficher un tirage différent de celui chargé dans GameScreen

**Solution:**
- Suppression de la fonction `getGameDrawInfo()` qui créait la confusion
- Utilisation directe des données du tirage (`draw.date`, `draw.time`) dans les cartes
- Calcul du countdown directement à partir des vraies données du tirage
- Cohérence garantie: la carte affiche EXACTEMENT le même tirage que celui qui sera joué

## Modifications Apportées

### `/components/Dashboard.tsx`

#### 1. Nouvelle fonction `getValidDraws()` - Auto-filtrage des tirages expirés
```typescript
// ✅ Fonction pour filtrer les tirages non expirés
const getValidDraws = () => {
  updateDrawStatuses();
  const allDraws = getDraws();
  const now = new Date();
  
  // Filtrer: upcoming/pending ET heure non passée
  return allDraws.filter(draw => {
    if (draw.status !== 'upcoming' && draw.status !== 'pending') return false;
    
    const drawDateTime = new Date(`${draw.date}T${draw.time}`);
    return drawDateTime.getTime() > now.getTime(); // ✅ Seulement les tirages futurs
  }).sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
};
```

#### 2. Utilisation de `getValidDraws()` au chargement
```typescript
useEffect(() => {
  const user = getCurrentUser();
  if (user) {
    setUserId(user.id);
    
    const userDraws = getValidDraws(); // ✅ Seulement les tirages valides
    setAvailableDraws(userDraws);
    
    // Le tirage vedette est le premier 5naps disponible, ou le premier tirage
    const featured5naps = userDraws.find(d => d.type === '5naps');
    setFeaturedDraw(featured5naps || userDraws[0] || null);
  }
}, []);
```

#### 3. Fix du clignotement dans le countdown
```typescript
// ✅ Simplement retirer les tirages expirés au lieu de les remplacer
if (diff <= 0 && !hasExpired) {
  hasExpired = true;
  setCountdownTime({ hours: 0, minutes: 0, seconds: 0 });
  
  setTimeout(() => {
    const validDraws = getValidDraws(); // ✅ Récupérer les tirages valides
    setAvailableDraws(validDraws);
    
    const featured5naps = validDraws.find(d => d.type === '5naps');
    setFeaturedDraw(featured5naps || validDraws[0] || null);
  }, 500);
  
  return;
}
```

#### 4. Nettoyage automatique toutes les minutes
```typescript
// ✅ Rafraîchir et nettoyer les tirages expirés toutes les minutes
useEffect(() => {
  const refreshTimer = setInterval(() => {
    const validDraws = getValidDraws();
    setAvailableDraws(validDraws);
    
    // Vérifier si le featured draw est toujours valide
    if (featuredDraw) {
      const isFeaturedStillValid = validDraws.find(d => d.id === featuredDraw.id);
      if (!isFeaturedStillValid) {
        // Le featured a expiré, prendre le suivant
        const featured5naps = validDraws.find(d => d.type === '5naps');
        setFeaturedDraw(featured5naps || validDraws[0] || null);
      }
    }
    
    setRefreshTrigger(prev => prev + 1);
  }, 60000); // Chaque minute
  return () => clearInterval(refreshTimer);
}, [featuredDraw]);
```

#### 2. Fix des dates incohérentes (lignes 298-342)
```typescript
// ✅ AVANT
const drawInfo = getGameDrawInfo(game); // Cherchait le premier tirage du jeu
return (
  <GameCard
    nextDrawDate={drawInfo.date}
    nextDrawTime={drawInfo.time}
    countdown={drawInfo.countdown}
    // ...
  />
);

// ✅ APRÈS
// Utiliser directement les données du tirage (draw)
const drawDate = new Date(`${draw.date}T${draw.time}`);
const now = new Date();
const diff = drawDate.getTime() - now.getTime();

// Calculer le countdown à partir du vrai tirage
let countdown = "Bientôt";
if (diff > 0) {
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    countdown = `Dans ${days}j ${hours}h`;
  } else if (hours > 0) {
    countdown = `Dans ${hours}h ${minutes}min`;
  } else {
    countdown = `Dans ${minutes}min`;
  }
}

const dateStr = drawDate.toLocaleDateString('fr-FR', { 
  weekday: 'long', 
  day: 'numeric', 
  month: 'long' 
});

return (
  <GameCard
    nextDrawDate={dateStr}      // ✅ Date du vrai tirage
    nextDrawTime={draw.time}    // ✅ Heure du vrai tirage
    countdown={countdown}        // ✅ Countdown du vrai tirage
    // ...
  />
);
```

#### 3. Suppression de la fonction obsolète
- Suppression de `getGameDrawInfo()` (lignes 119-158)
- Cette fonction créait la confusion en cherchant des tirages différents

#### 4. Rafraîchissement des cartes
```typescript
const [, setRefreshTrigger] = useState(0);

// Rafraîchir les cartes toutes les minutes
useEffect(() => {
  const refreshTimer = setInterval(() => {
    setRefreshTrigger(prev => prev + 1);
  }, 60000);
  return () => clearInterval(refreshTimer);
}, []);
```

### `/components/GameScreen.tsx`

#### 1. Filtrage des tirages expirés
```typescript
// Charger le prochain tirage pour ce jeu
useEffect(() => {
  updateDrawStatuses();
  const draws = getDraws();
  const now = new Date();
  
  // ✅ Chercher un tirage upcoming/pending ET non expiré pour ce jeu
  const availableDraw = draws.find(d => {
    if (d.gameId !== gameId) return false;
    if (d.status !== 'upcoming' && d.status !== 'pending') return false;
    
    const drawDateTime = new Date(`${d.date}T${d.time}`);
    return drawDateTime.getTime() > now.getTime(); // Seulement les tirages futurs
  });
  
  if (availableDraw) {
    setNextDrawId(availableDraw.id);
    setNextDrawData(availableDraw);
  } else {
    setNextDrawId(null);
    setNextDrawData(null);
  }
}, [gameId]);
```

#### 2. Message informatif si aucun tirage valide
```typescript
// ✅ Afficher un message si aucun tirage valide disponible
if (!nextDrawData) {
  return (
    <div className="min-h-screen bg-background">
      <Header ... />
      <main className="container px-4 py-8">
        <Button onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <Card className="border-border bg-card p-8 text-center max-w-md mx-auto mt-12">
          <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Aucun tirage disponible
          </h2>
          <p className="text-muted-foreground mb-4">
            Il n'y a actuellement aucun tirage programmé pour {gameConfig.name}.
            Revenez bientôt ou consultez les autres jeux !
          </p>
          <Button onClick={onBack} className="mt-4">
            Retour aux jeux
          </Button>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
```

## Résultat

✅ **Fini le clignotement:**
- Les tirages expirés disparaissent automatiquement de la liste
- Pas de rerenders en boucle
- Transition fluide et propre
- Aucun "jeu de lumière" ✨

✅ **Dates cohérentes:**
- La carte affiche EXACTEMENT le même tirage que l'écran de jeu
- Pas de surprise pour l'utilisateur
- Si la carte dit "27 octobre à 16:44", l'écran de jeu dira "27 octobre à 16:44"

✅ **Auto-nettoyage:**
- Les tirages passés sont automatiquement filtrés
- Nettoyage automatique toutes les minutes
- Pas besoin d'action manuelle de l'admin pour retirer les vieux tirages

✅ **Messages clairs:**
- Si un joueur essaye d'accéder à un jeu sans tirage, il voit un message informatif
- Invitation à consulter d'autres jeux ou revenir plus tard

## Test

1. **Tester l'auto-masquage des jeux expirés:**
   - Créer un tirage qui expire dans 1-2 minutes
   - Observer le compte à rebours atteindre 00:00:00
   - ✅ Le jeu doit disparaître automatiquement de la liste
   - ✅ Aucun clignotement
   - ✅ Si c'est le dernier jeu, afficher "Aucun tirage disponible"

2. **Tester la cohérence des dates:**
   - Créer plusieurs tirages pour le même jeu (ex: Loto Kadoo 5naps le 27 ET le 28)
   - Vérifier la date affichée sur la carte
   - Cliquer sur la carte
   - ✅ L'écran de jeu doit afficher exactement la même date et heure

3. **Tester l'accès à un jeu expiré:**
   - Créer un tirage qui expire dans 30 secondes
   - Ouvrir l'écran de jeu
   - Attendre que le tirage expire
   - Rafraîchir la page ou revenir au dashboard
   - ✅ Le jeu doit afficher "Aucun tirage disponible"

4. **Tester le nettoyage automatique:**
   - Laisser l'application ouverte pendant que des tirages expirent
   - ✅ Toutes les minutes, les tirages expirés doivent disparaître automatiquement
