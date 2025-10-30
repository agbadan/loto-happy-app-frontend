# 🐛 Debug des Tirages - Console

## Copier-Coller dans la Console (F12)

### 1. Voir TOUS les tirages
```javascript
const draws = JSON.parse(localStorage.getItem('loto_happy_draws') || '[]');
console.log('📋 TOUS LES TIRAGES:');
console.table(draws.map(d => ({
  id: d.id,
  idType: typeof d.id,
  operateur: d.operatorId,
  date: d.date,
  heure: d.time,
  status: d.status
})));
```

### 2. Voir les IDs uniquement
```javascript
const draws = JSON.parse(localStorage.getItem('loto_happy_draws') || '[]');
console.log('🔑 IDs des tirages:');
draws.forEach(d => {
  console.log(`ID: "${d.id}" (Type: ${typeof d.id})`);
});
```

### 3. Vérifier si un ID spécifique existe
```javascript
// Remplacer 'VOTRE_ID' par l'ID que vous cherchez
const drawId = 'VOTRE_ID';
const draws = JSON.parse(localStorage.getItem('loto_happy_draws') || '[]');
const found = draws.find(d => String(d.id) === String(drawId));
console.log(found ? '✅ Trouvé:' : '❌ Pas trouvé');
console.log(found);
```

### 4. Nettoyer TOUTES les données (ATTENTION !)
```javascript
// ⚠️ CELA SUPPRIME TOUT !
localStorage.clear();
location.reload();
```

### 5. Créer un tirage de test manuellement
```javascript
const testDraw = {
  id: `draw-test-${Date.now()}`,
  operatorId: 'lotto-kadoo',
  date: '2025-10-30',
  time: '14:00',
  multipliers: {
    NAP1: 10,
    NAP2: 500,
    NAP3: 2500,
    NAP4: 10000,
    NAP5: 100000,
    PERMUTATION: 500,
    BANKA: 500,
    CHANCE_PLUS: 90,
    ANAGRAMME: 10
  },
  status: 'upcoming',
  winningNumbers: [],
  createdAt: new Date().toISOString(),
  createdBy: 'debug'
};

const draws = JSON.parse(localStorage.getItem('loto_happy_draws') || '[]');
draws.push(testDraw);
localStorage.setItem('loto_happy_draws', JSON.stringify(draws));
console.log('✅ Tirage de test créé avec ID:', testDraw.id);
location.reload();
```

## 📝 Interprétation des Résultats

### Cas 1 : Aucun tirage
```
📋 TOUS LES TIRAGES: []
```
**Solution :** Créer un tirage avec l'admin

### Cas 2 : Tirages avec IDs en number
```
ID: 1730224800000 (Type: number)
ID: 1730311200000 (Type: number)
```
**Problème :** Anciens tirages avec IDs en number  
**Solution :** La correction appliquée gère ce cas

### Cas 3 : Tirages avec IDs en string
```
ID: "draw-1730224800000-abc123" (Type: string)
ID: "draw-1730311200000-xyz789" (Type: string)
```
**Bon :** Format correct

### Cas 4 : Mix string/number
```
ID: 1730224800000 (Type: number)
ID: "draw-1730311200000-xyz789" (Type: string)
```
**Solution :** La correction appliquée gère ce cas avec `String()`
