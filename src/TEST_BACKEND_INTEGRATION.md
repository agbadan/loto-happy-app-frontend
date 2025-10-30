# 🧪 GUIDE DE TEST - Intégration Backend

**Backend URL:** `https://together-fresh-alien.ngrok-free.app`  
**Date:** 30 Octobre 2025

---

## 📋 RÉSUMÉ

J'ai créé **3 nouveaux fichiers** qui permettent à votre frontend de communiquer avec le backend :

1. `/utils/apiClient.ts` - Client HTTP centralisé
2. `/utils/authAPI.ts` - Toutes les fonctions d'authentification
3. `/utils/drawsAPI.ts` - Toutes les fonctions pour tirages et paris
4. `/utils/withdrawalsAPI.ts` - Toutes les fonctions pour les retraits

**Ce qui fonctionne déjà :**
- ✅ Connexion au backend via API
- ✅ Gestion automatique du token JWT
- ✅ Gestion des erreurs

**Ce qu'il reste à faire :**
- 🔧 Modifier les composants pour utiliser ces nouvelles fonctions
- 🔧 Remplacer `localStorage` par les appels API

---

## 🎯 POUR TESTER L'INTÉGRATION

### Option 1: Test manuel dans la console

Ouvrez la console de votre navigateur (F12) et testez :

```javascript
// Importer les fonctions
import { loginUser } from './utils/authAPI';

// Tester la connexion
const user = await loginUser({
  emailOrPhone: 'test@example.com',
  password: 'password123'
});

console.log('User connecté:', user);
```

### Option 2: Vérifier l'URL du backend

Dans la console :
```javascript
console.log('Backend URL:', process.env.REACT_APP_API_BASE_URL);
// Devrait afficher: https://together-fresh-alien.ngrok-free.app
```

### Option 3: Tester un appel API simple

```javascript
import api from './utils/apiClient';

// Tester GET /api/draws/upcoming
const draws = await api.get('/api/draws/upcoming');
console.log('Tirages:', draws);
```

---

## 📝 CE QU'IL FAUT FAIRE ENSUITE

Pour finaliser l'intégration, il faut modifier les composants suivants :

### 1. App.tsx
- Utiliser `initAuth()` au démarrage
- Gérer l'état de connexion avec le token JWT

### 2. PasswordLoginScreen.tsx
- Remplacer `loginUser` de `./utils/auth` par `./utils/authAPI`
- Ajouter un état `loading` pendant la connexion
- Gérer les erreurs API

### 3. RegistrationScreen.tsx
- Remplacer `registerUser` de `./utils/auth` par `./utils/authAPI`
- Ajouter un état `loading`
- Gérer les erreurs API

### 4. Dashboard.tsx
- Remplacer `getDraws()` par `getUpcomingDraws()` de `./utils/drawsAPI`
- Ajouter un état `loading` pendant le chargement
- Afficher un message d'erreur si échec

### 5. GameScreen.tsx
- Remplacer `createTicket()` par la version de `./utils/drawsAPI`
- Gérer les erreurs (solde insuffisant, tirage fermé, etc.)

---

## ✅ CHECKLIST RAPIDE

Pour vérifier que tout est prêt :

- [x] Fichier `.env` créé avec l'URL du backend
- [x] Fichier `/utils/apiClient.ts` créé
- [x] Fichier `/utils/authAPI.ts` créé
- [x] Fichier `/utils/drawsAPI.ts` créé
- [x] Fichier `/utils/withdrawalsAPI.ts` créé
- [ ] Composants mis à jour pour utiliser les nouvelles fonctions
- [ ] Tests d'inscription/connexion fonctionnels
- [ ] Tests d'achat de ticket fonctionnels

---

## 🚨 PROBLÈMES COURANTS

### Le backend ne répond pas
**Erreur:** `NETWORK_ERROR: Impossible de contacter le serveur`

**Solution:**
1. Vérifier que l'URL dans `.env` est correcte
2. Vérifier que le backend ngrok est toujours actif
3. Vérifier dans les outils réseau du navigateur (F12 → Network)

### Token expiré
**Erreur:** `401 Unauthorized`

**Solution:**
- Se reconnecter (le token JWT expire après 15 minutes)
- L'app devrait gérer ça automatiquement et déconnecter l'utilisateur

### CORS
**Erreur:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Solution:**
- Le backend doit autoriser l'origine de votre frontend
- Vérifier la configuration CORS côté backend

---

## 📚 DOCUMENTATION COMPLÈTE

Pour plus de détails, consultez :
- **BACKEND_INTEGRATION_GUIDE.md** - Guide technique complet
- **NEXT_STEPS_INTEGRATION.md** - Étapes détaillées pour chaque composant
- **API_EXAMPLES.md** - Exemples de requêtes/réponses
- **FRONTEND_BACKEND_MAPPING.md** - Correspondance localStorage ↔ API

---

## 💬 QUESTIONS FRÉQUENTES

### Q: Dois-je supprimer `/utils/auth.ts` ?
**R:** Pas encore ! Gardez-le tant que tous les composants n'ont pas été migrés.

### Q: Comment gérer le loading pendant les requêtes ?
**R:** Utilisez un état `loading` dans chaque composant :
```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await api.post('/api/tickets', data);
  } catch (error) {
    // gérer erreur
  } finally {
    setLoading(false);
  }
};
```

### Q: Comment afficher les erreurs à l'utilisateur ?
**R:** Utilisez `toast.error()` :
```typescript
try {
  await loginUser({...});
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    toast.error('Une erreur inattendue est survenue');
  }
}
```

---

**Prochaine action recommandée :** Lire NEXT_STEPS_INTEGRATION.md et commencer par modifier App.tsx
