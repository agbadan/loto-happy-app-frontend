# 🔄 MODE FALLBACK - GUIDE COMPLET

## 📌 Qu'est-ce que le Mode Fallback ?

Le **Mode Fallback** permet à l'application de fonctionner **même si le backend n'est pas accessible**.

Quand le backend est injoignable (erreur réseau, serveur arrêté, etc.), l'app bascule automatiquement sur l'ancien système **localStorage** pour :
- Authentification (connexion, inscription)
- Tirages (affichage)
- Paris (achat de tickets)

---

## ⚙️ Configuration

### Activer/Désactiver le Mode Fallback

Ouvrir `/utils/config.ts` :

```typescript
export const CONFIG = {
  // Mode développement : utilise localStorage si le backend n'est pas accessible
  // Mettre à false pour forcer l'utilisation du backend
  USE_LOCALHOST_FALLBACK: true, // ✅ Activé par défaut
  
  // URL du backend
  API_BASE_URL: 'https://together-fresh-alien.ngrok-free.app',
  
  // Afficher les logs de développement
  DEBUG: true,
};
```

**Pour désactiver le fallback** (forcer l'utilisation du backend uniquement) :
```typescript
USE_LOCALHOST_FALLBACK: false,
```

---

## 🎯 Fonctionnement

### 1. Connexion (Login)

**Avec backend :**
```
User clique "Se connecter"
  ↓
Appel API POST /api/auth/login
  ↓
Backend renvoie token JWT
  ↓
Token stocké + utilisateur chargé
  ↓
✅ Succès
```

**Sans backend (fallback) :**
```
User clique "Se connecter"
  ↓
Appel API POST /api/auth/login
  ↓
❌ Erreur NETWORK_ERROR
  ↓
⚠️ Détection du fallback activé
  ↓
Appel loginUser() de l'ancien système (utils/auth.ts)
  ↓
Vérification dans localStorage
  ↓
✅ Succès (mode localStorage)
```

### 2. Inscription (Register)

**Avec backend :**
```
User remplit formulaire
  ↓
Appel API POST /api/auth/register
  ↓
Backend crée l'utilisateur + renvoie token
  ↓
✅ Succès
```

**Sans backend (fallback) :**
```
User remplit formulaire
  ↓
Appel API POST /api/auth/register
  ↓
❌ Erreur NETWORK_ERROR
  ↓
⚠️ Détection du fallback activé
  ↓
Appel createUser() de l'ancien système
  ↓
Création dans localStorage
  ↓
✅ Succès (mode localStorage)
```

### 3. Chargement des Tirages

**Avec backend :**
```
Dashboard charge
  ↓
Appel API GET /api/draws/upcoming
  ↓
Backend renvoie les tirages
  ↓
✅ Affichage
```

**Sans backend (fallback) :**
```
Dashboard charge
  ↓
Appel API GET /api/draws/upcoming
  ↓
❌ Erreur NETWORK_ERROR
  ↓
⚠️ Détection du fallback activé
  ↓
Appel getDraws() de l'ancien système (utils/draws.ts)
  ↓
Lecture depuis localStorage
  ↓
✅ Affichage (données locales)
```

### 4. Achat de Ticket

**Avec backend :**
```
User valide son pari
  ↓
Appel API POST /api/tickets
  ↓
Backend crée le ticket + déduit le solde
  ↓
Solde rafraîchi
  ↓
✅ Succès
```

**Sans backend (fallback) :**
```
User valide son pari
  ↓
Appel API POST /api/tickets
  ↓
❌ Erreur NETWORK_ERROR
  ↓
⚠️ Détection du fallback activé
  ↓
Appel createTicket() de l'ancien système (utils/draws.ts)
  ↓
Ticket créé dans localStorage
  ↓
Solde déduit localement
  ↓
✅ Succès (données locales)
```

---

## 🧪 Comment Tester

### Test 1: Mode Normal (backend accessible)

```bash
1. S'assurer que USE_LOCALHOST_FALLBACK = true dans config.ts
2. S'assurer que le backend est ACTIF sur l'URL configurée
3. Se connecter
4. Vérifier dans F12 → Network :
   - Requête POST /api/auth/login visible ✅
   - Pas de warning "⚠️ Backend non accessible" dans Console ✅
5. Acheter un ticket
6. Vérifier dans Network :
   - Requête POST /api/tickets visible ✅
```

### Test 2: Mode Fallback (backend inaccessible)

```bash
1. S'assurer que USE_LOCALHOST_FALLBACK = true dans config.ts
2. S'assurer que le backend est ARRÊTÉ ou URL invalide
3. Se connecter
4. Vérifier dans F12 → Console :
   - "⚠️ Backend non accessible, utilisation du mode localStorage" ✅
5. Vérifier dans Network :
   - Requête POST /api/auth/login échoue (status failed) ✅
6. Vérifier que la connexion fonctionne quand même ✅
7. Acheter un ticket
8. Vérifier dans Console :
   - "⚠️ Backend non accessible pour createTicket, utilisation localStorage" ✅
9. Vérifier que l'achat fonctionne ✅
```

### Test 3: Mode Backend Strict (fallback désactivé)

```bash
1. Mettre USE_LOCALHOST_FALLBACK = false dans config.ts
2. Arrêter le backend
3. Essayer de se connecter
4. Vérifier dans F12 → Console :
   - Erreur "Impossible de contacter le serveur" ❌
   - PAS de warning "⚠️ Backend non accessible" (normal) ✅
5. L'app ne fonctionne PAS (comportement attendu) ✅
```

---

## 📊 Tableau des Fonctions avec Fallback

| Fonction API | Fallback localStorage | Fichier |
|--------------|----------------------|---------|
| `loginUser()` | ✅ `oldAuth.loginUser()` | authAPI.ts |
| `registerUser()` | ✅ `oldAuth.createUser()` | authAPI.ts |
| `initAuth()` | ✅ `oldAuth.isUserLoggedIn()` + `getCurrentUser()` | authAPI.ts |
| `refreshUserData()` | ✅ `oldAuth.getCurrentUser()` | authAPI.ts |
| `getUpcomingDraws()` | ✅ `oldDraws.getDraws()` | drawsAPI.ts |
| `createTicket()` | ✅ `oldDraws.createTicket()` + `auth.deductBetCost()` | drawsAPI.ts |

---

## 🚨 Limitations du Mode Fallback

### ⚠️ Ce qui NE fonctionne PAS en mode fallback :

1. **Synchronisation multi-appareils**
   - Données stockées localement uniquement
   - Pas de sync entre navigateurs/appareils

2. **Retraits**
   - Impossible d'approuver des retraits (nécessite backend)

3. **Statistiques temps réel**
   - Les stats admin sont figées (localStorage)

4. **Distribution des gains automatique**
   - Les gains ne sont pas distribués après un tirage
   - Nécessite le backend pour calculer les gagnants

5. **Gestion revendeurs → joueurs**
   - Le crédit de joueur par revendeur ne fonctionne qu'en local
   - Pas de sync avec le backend

### ✅ Ce qui fonctionne quand même :

1. **Connexion/Inscription**
2. **Affichage des tirages**
3. **Achat de tickets**
4. **Affichage du profil**
5. **Conversion Gains → Solde de Jeu** (localement)

---

## 🔧 Personnalisation

### Ajouter un Fallback pour une nouvelle fonction

Exemple pour une fonction hypothétique `getWinningHistory()` :

```typescript
// Dans drawsAPI.ts

export async function getWinningHistory(): Promise<Win[]> {
  try {
    return await api.get<Win[]>('/api/wins/history');
  } catch (error) {
    // FALLBACK
    if (error instanceof ApiError && error.code === 'NETWORK_ERROR' && DEV_MODE.useLocalStorageFallback) {
      console.warn('⚠️ Backend non accessible pour getWinningHistory, utilisation localStorage');
      
      // Logique de fallback ici
      const localWins = localStorage.getItem('wins_history');
      return localWins ? JSON.parse(localWins) : [];
    }
    
    // Si pas de fallback ou autre erreur
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error('Erreur lors de la récupération de l\'historique');
  }
}
```

---

## 💡 Recommandations

### En Développement
```typescript
USE_LOCALHOST_FALLBACK: true  // ✅ Activé
```
- Permet de développer même si le backend est hors ligne
- Facilite les tests frontend

### En Production
```typescript
USE_LOCALHOST_FALLBACK: false  // ❌ Désactivé
```
- Force l'utilisation du backend
- Évite les incohérences de données
- Garantit la synchronisation

---

## 🎉 Avantages du Système

1. **Résilience** : L'app fonctionne même si le backend est down
2. **Développement rapide** : Pas besoin d'avoir le backend pour développer
3. **Tests facilités** : Peut tester le frontend sans backend
4. **Migration progressive** : Permet de garder les 2 systèmes en parallèle
5. **Expérience utilisateur** : Pas de "page blanche" si erreur réseau temporaire

---

## 🚀 Prochaines Étapes

Pour améliorer le système :

1. **Ajouter un indicateur visuel** montrant si on est en mode fallback
2. **Synchroniser les données** quand le backend revient
3. **Queue des actions** non envoyées au backend (tickets, etc.)
4. **Auto-retry** : réessayer d'appeler le backend toutes les X secondes
5. **Service Worker** pour mettre l'app en cache (PWA)

---

## 📝 Logs de Développement

Quand le mode fallback est actif, vous verrez ces messages dans la console :

```
⚠️ Backend non accessible, utilisation du mode localStorage
⚠️ Backend non accessible pour inscription, utilisation localStorage
⚠️ Backend non accessible lors de initAuth, utilisation localStorage
⚠️ Backend non accessible pour getUpcomingDraws, utilisation localStorage
⚠️ Backend non accessible pour createTicket, utilisation localStorage
```

Ces logs sont **normaux** et indiquent que le système de fallback fonctionne correctement.

---

**🎯 Le mode fallback garantit que votre app fonctionne TOUJOURS, backend ou pas !**
